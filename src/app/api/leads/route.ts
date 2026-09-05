import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/telegram";
import { createLead, deleteLead, listLeads, updateLead } from "@/lib/leadStore";
import { normalizeUzPhone } from "@/lib/phone";
import { isAuthed, isSameOrigin } from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";
import { LEAD_OPTIONS, type LeadType, type LeadStatus } from "@/lib/leads";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers });
}

function forbidden() {
  return json({ success: false, error: "So'rov rad etildi" }, 403);
}

function unauthorized() {
  return json({ success: false, error: "Ruxsat yo'q" }, 401);
}

const VALID_TYPES: LeadType[] = ["maktab", "kurs", "umumiy"];
const FALLBACK_INTEREST = "Boshqa yo'nalish / Maslahat olish";
/** Sayt formalari yuboradigan rasmiy manbalar. Ro'yxatda yo'q qiymat "sayt" ga tushadi. */
const ALLOWED_SOURCES = new Set([
  "sayt",
  "Sayt — ro'yxatdan o'tish oynasi",
  "Sayt — pastki ariza formasi",
  "Admin — offline migratsiya",
]);
const VALID_STATUSES: LeadStatus[] = ["yangi", "boglangan", "qabul_qilindi", "bekor_qilindi"];
const MAX_BODY_BYTES = 8 * 1024;

/** Nazorat belgilarini olib tashlash (log/CSV injection va chalkash kiritishlarga qarshi). */
function clean(value: string, max: number): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    // Ko'rinmas belgilar (zero-width space va h.k.) — ularsiz "   " kabi bo'sh ism
    // uzunlik tekshiruvidan o'tib ketardi.
    .replace(/[\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeLeadBody(body: Record<string, unknown>) {
  const str = (v: unknown, max: number) => (typeof v === "string" ? clean(v, max) : "");

  const name = str(body.name, 120);
  const rawPhone = str(body.phone, 30);
  const rawType = typeof body.type === "string" ? body.type : "umumiy";
  const type: LeadType = VALID_TYPES.includes(rawType as LeadType)
    ? (rawType as LeadType)
    : "umumiy";
  // Yo'nalish faqat rasmiy ro'yxatdan bo'lishi mumkin. Ilgari bu erkin matn edi va
  // bot Telegram bildirishnomasiga ixtiyoriy reklama matnini joylashtira olardi.
  const rawInterest = str(body.targetInterest, 160);
  const knownInterest = LEAD_OPTIONS.find((o) => o.value === rawInterest);
  const targetInterest = knownInterest ? knownInterest.value : FALLBACK_INTEREST;
  const preferredTime = str(body.preferredTime, 80) || undefined;
  const notes = str(body.notes, 400) || undefined;
  // Manba ham erkin matn bo'lmasligi kerak — u ham Telegram xabariga tushadi.
  const rawSource = str(body.source, 60);
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "sayt";

  const errors: string[] = [];
  if (name.length < 2 || !/\p{L}/u.test(name)) {
    errors.push("Ismni to'liq kiriting (kamida 2 ta harf)");
  }

  const phone = normalizeUzPhone(rawPhone);
  if (!phone) {
    errors.push("Telefonni 9 xonali raqam yoki +998 va 9 ta raqam ko'rinishida kiriting");
  }

  return { payload: { name, phone: phone ?? rawPhone, type, targetInterest, preferredTime, notes, source }, errors };
}

/** So'rov tanasini hajm cheklovi bilan o'qish. */
async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY_BYTES) return null;
  const text = await req.text().catch(() => "");
  if (!text || text.length > MAX_BODY_BYTES) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** GET — faqat admin (imzolangan cookie). Barcha arizalar ro'yxati. */
export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const leads = await listLeads();
  return json({ success: true, leads }, 200, { "Cache-Control": "no-store" });
}

/** POST — ochiq (sayt formalari). Yangi ariza + Telegram bildirishnoma. */
export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) return forbidden();

    // Rate-limit: IP bo'yicha 1 daqiqada 5 ta, 1 soatda 20 ta.
    const { key: ip, trusted } = clientIdentity(req);
    const perMinute = await rateLimit(`lead:m:${ip}`, 5, 60);
    const perHour = await rateLimit(`lead:h:${ip}`, 20, 3600);
    // IP sarlavhasiga ishonib bo'lmasa (proksi sozlanmagan), bot uni aylantirib
    // yuqoridagi chegaralarni chetlab o'tishi mumkin — shu sabab umumiy shift qo'yamiz.
    // Haqiqiy trafik bunga yetmaydi, spam esa shu yerda to'xtaydi.
    const globalCap = trusted ? null : await rateLimit("lead:global", 60, 60);
    const blocked = !perMinute.allowed
      ? perMinute
      : !perHour.allowed
        ? perHour
        : globalCap && !globalCap.allowed
          ? globalCap
          : null;
    if (blocked) {
      return json(
        { success: false, error: "Juda ko'p so'rov yuborildi, birozdan so'ng urinib ko'ring" },
        429,
        { "Retry-After": String(blocked.retryAfter || 60) }
      );
    }

    const body = await readJsonBody(req);
    if (!body) return json({ success: false, error: "Noto'g'ri so'rov formati" }, 400);

    // Honeypot maydoni (botlar to'ldiradi) — jimgina muvaffaqiyat qaytaramiz.
    if (typeof body.website === "string" && body.website.trim()) {
      return json({ success: true, message: "Arizangiz qabul qilindi!" }, 201);
    }

    const { payload, errors } = normalizeLeadBody(body);
    if (errors.length) return json({ success: false, error: errors.join("; ") }, 400);

    const idempotencyKey =
      req.headers.get("idempotency-key")?.trim() ||
      req.headers.get("x-idempotency-key")?.trim() ||
      undefined;

    const result = await createLead(payload, idempotencyKey);
    const lead = result.lead;

    // Faqat yangi yaratilgan ariza bo'lsa Telegram bildirishnoma yuboramiz (qayta/idempotent arizalarni takrorlamaslik uchun).
    let telegramNotified = false;
    if (result.created) {
      const tg = await sendLeadNotification(lead).catch((err) => {
        console.error("Telegram notification failed:", err);
        return { success: false as const };
      });
      telegramNotified = !!tg.success;
    }

    return json(
      {
        success: true,
        message: result.created
          ? "Arizangiz muvaffaqiyatli qabul qilindi!"
          : "Arizangiz allaqachon qabul qilingan",
        lead,
        created: result.created,
        telegramNotified,
      },
      result.created ? 201 : 200
    );
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err?.status === 409) {
      return json({ success: false, error: err.message || "Bu yuborish kaliti boshqa ariza uchun ishlatilgan" }, 409);
    }
    console.error("Lead API Error:", error);
    return json({ success: false, error: "Serverda xatolik yuz berdi" }, 500);
  }
}

/** PATCH — faqat admin. Status / izoh yangilash. */
export async function PATCH(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  if (!isSameOrigin(req)) return forbidden();
  try {
    const body = await readJsonBody(req);
    if (!body) return json({ success: false, error: "Noto'g'ri so'rov formati" }, 400);

    const { id, status, adminNotes } = body as {
      id?: string;
      status?: LeadStatus;
      adminNotes?: string;
    };
    if (!id || typeof id !== "string") return json({ success: false, error: "Ariza ID si kerak" }, 400);

    const patch: { status?: LeadStatus; adminNotes?: string } = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return json({ success: false, error: "Noto'g'ri status" }, 400);
      }
      patch.status = status;
    }
    if (adminNotes !== undefined) {
      patch.adminNotes = clean(String(adminNotes), 600);
    }
    if (patch.status === undefined && patch.adminNotes === undefined) {
      return json({ success: false, error: "Yangilash uchun maydon berilmadi" }, 400);
    }

    const updated = await updateLead(id, patch);
    if (!updated) return json({ success: false, error: "Ariza topilmadi" }, 404);
    return json({ success: true, message: "Ariza holati yangilandi", lead: updated });
  } catch (error) {
    console.error("Lead PATCH Error:", error);
    return json({ success: false, error: "Xatolik yuz berdi" }, 500);
  }
}

/** DELETE — faqat admin. Ariza o'chirish. */
export async function DELETE(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  if (!isSameOrigin(req)) return forbidden();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return json({ success: false, error: "Ariza ID si kerak" }, 400);
    const ok = await deleteLead(id);
    if (!ok) return json({ success: false, error: "Ariza topilmadi" }, 404);
    return json({ success: true, message: "Ariza o'chirildi" });
  } catch (error) {
    console.error("Lead DELETE Error:", error);
    return json({ success: false, error: "Xatolik yuz berdi" }, 500);
  }
}
