import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/telegram";
import {
  createLead,
  deleteLead,
  deleteLeadsBatch,
  listLeadsPage,
  updateLead,
  updateLeadsBatch,
} from "@/lib/leadStore";
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

import { cleanText } from "@/lib/sanitize";

function normalizeLeadBody(body: Record<string, unknown>) {
  const str = (v: unknown, max: number) => cleanText(v, max);

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

/**
 * GET — faqat admin (imzolangan cookie).
 *
 * `?limit=` va `?offset=` bilan sahifalanadi (default 200 ta). Eski mijozlar
 * uchun `leads` maydoni saqlab qolingan, `total`/`hasMore` esa qo'shimcha.
 */
export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();

  // Admin GET so'rovlariga rate-limit (daqiqasiga 180 ta — DDoS va tajovuzkor skriptlardan himoya)
  const { key: ip } = clientIdentity(req);
  const getLimit = await rateLimit(`admin:get:${ip}`, 180, 60);
  if (!getLimit.allowed) {
    return json(
      { success: false, error: "Juda ko'p so'rov yuborildi, birozdan so'ng qayta urinib ko'ring" },
      429,
      { "Retry-After": String(getLimit.retryAfter || 60) }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 200);
  const offset = Number(searchParams.get("offset") ?? 0);
  const search = searchParams.get("search") || undefined;
  const rawStatus = searchParams.get("status") || undefined;
  const rawType = searchParams.get("type") || undefined;
  const rawDateRange = searchParams.get("dateRange") || undefined;

  const status =
    rawStatus && (VALID_STATUSES.includes(rawStatus as LeadStatus) || rawStatus === "hammasi")
      ? (rawStatus as LeadStatus | "hammasi")
      : undefined;
  const type =
    rawType && (VALID_TYPES.includes(rawType as LeadType) || rawType === "hammasi")
      ? (rawType as LeadType | "hammasi")
      : undefined;
  const dateRange =
    rawDateRange && ["bugun", "hafta", "oy", "hammasi"].includes(rawDateRange)
      ? (rawDateRange as "bugun" | "hafta" | "oy" | "hammasi")
      : undefined;

  const page = await listLeadsPage(
    Number.isFinite(offset) ? offset : 0,
    Number.isFinite(limit) ? limit : 200,
    { search, status, type, dateRange }
  );
  return json(
    {
      success: true,
      leads: page.leads,
      total: page.total,
      offset: page.offset,
      hasMore: page.hasMore,
      stats: page.stats,
    },
    200,
    { "Cache-Control": "no-store" }
  );
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

/** PATCH — faqat admin. Status / izoh yangilash (bitta yoki ko'plab arizalar). */
export async function PATCH(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  if (!isSameOrigin(req)) return forbidden();
  try {
    const body = await readJsonBody(req);
    if (!body) return json({ success: false, error: "Noto'g'ri so'rov formati" }, 400);

    const { id, ids, status, adminNotes } = body as {
      id?: string;
      ids?: string[];
      status?: LeadStatus;
      adminNotes?: string;
    };

    const hasSingleId = typeof id === "string" && id.trim().length > 0;
    const hasBatchIds = Array.isArray(ids) && ids.length > 0;

    if (!hasSingleId && !hasBatchIds) {
      return json({ success: false, error: "Ariza ID si yoki arizalar ro'yxati kerak" }, 400);
    }

    const patch: { status?: LeadStatus; adminNotes?: string } = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return json({ success: false, error: "Noto'g'ri status" }, 400);
      }
      patch.status = status;
    }
    if (adminNotes !== undefined) {
      patch.adminNotes = cleanText(String(adminNotes), 600);
    }
    if (patch.status === undefined && patch.adminNotes === undefined) {
      return json({ success: false, error: "Yangilash uchun maydon berilmadi" }, 400);
    }

    if (hasBatchIds) {
      const validIds = (ids as string[]).filter((x) => typeof x === "string" && x.trim());
      const result = await updateLeadsBatch(validIds, patch);
      return json({
        success: true,
        message: `${result.updatedCount} ta ariza holati yangilandi`,
        count: result.updatedCount,
      });
    }

    const updated = await updateLead(id!, patch);
    if (!updated) return json({ success: false, error: "Ariza topilmadi" }, 404);
    return json({ success: true, message: "Ariza holati yangilandi", lead: updated });
  } catch (error) {
    console.error("Lead PATCH Error:", error);
    return json({ success: false, error: "Xatolik yuz berdi" }, 500);
  }
}

/** DELETE — faqat admin. Ariza o'chirish (bitta yoki ko'plab). */
export async function DELETE(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  if (!isSameOrigin(req)) return forbidden();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    if (!id && !idsParam) {
      return json({ success: false, error: "Ariza ID si yoki ID lar ro'yxati kerak" }, 400);
    }

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        return json({ success: false, error: "Ariza ID si kerak" }, 400);
      }
      const result = await deleteLeadsBatch(ids);
      return json({
        success: true,
        message: `${result.deletedCount} ta ariza o'chirildi`,
        count: result.deletedCount,
      });
    }

    const ok = await deleteLead(id!);
    if (!ok) return json({ success: false, error: "Ariza topilmadi" }, 404);
    return json({ success: true, message: "Ariza o'chirildi" });
  } catch (error) {
    console.error("Lead DELETE Error:", error);
    return json({ success: false, error: "Xatolik yuz berdi" }, 500);
  }
}
