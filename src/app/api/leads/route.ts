import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/telegram";
import { addLead, deleteLead, listLeads, updateLead } from "@/lib/leadStore";
import { isAuthed } from "@/lib/adminAuth";
import type { LeadType, LeadStatus } from "@/lib/leads";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

const VALID_TYPES: LeadType[] = ["maktab", "kurs", "umumiy"];
const VALID_STATUSES: LeadStatus[] = ["yangi", "boglangan", "qabul_qilindi", "bekor_qilindi"];
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

function normalizeLeadBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const rawType = typeof body.type === "string" ? body.type : "umumiy";
  const type: LeadType = VALID_TYPES.includes(rawType as LeadType)
    ? (rawType as LeadType)
    : "umumiy";
  const targetInterest =
    typeof body.targetInterest === "string" && body.targetInterest.trim()
      ? body.targetInterest.trim().slice(0, 160)
      : "Umumiy ma'lumot";
  const preferredTime =
    typeof body.preferredTime === "string" && body.preferredTime.trim()
      ? body.preferredTime.trim().slice(0, 80)
      : undefined;
  const notes =
    typeof body.notes === "string" && body.notes.trim()
      ? body.notes.trim().slice(0, 400)
      : undefined;
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, 60)
      : "sayt";

  const errors: string[] = [];
  if (name.length < 2) errors.push("Ism kamida 2 ta belgidan iborat bo'lishi kerak");
  if (!PHONE_RE.test(phone)) errors.push("Telefon raqam noto'g'ri formatda");
  return { payload: { name, phone, type, targetInterest, preferredTime, notes, source }, errors };
}

/** GET — faqat admin (cookie). Barcha arizalar ro'yxati. */
export async function GET(req: Request) {
  if (!isAuthed(req)) return json({ success: false, error: "Ruxsat yo'q" }, 401);
  const leads = await listLeads();
  return json({ success: true, leads });
}

/** POST — ochiq (sayt formalari). Yangi ariza + Telegram bildirishnoma. */
export async function POST(req: Request) {
  try {
    // Juda oddiy rate-limit: IP + 1 daqiqa ichida 10 tadan ko'p bo'lmasin (in-memory).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const hits = rateMap.get(ip) ?? [];
    const recent = hits.filter((t) => now - t < 60_000);
    if (recent.length >= 10) {
      return json({ success: false, error: "Juda ko'p so'rov yuborildi, birozdan so'ng urinib ko'ring" }, 429);
    }
    rateMap.set(ip, [...recent, now]);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ success: false, error: "Noto'g'ri so'rov formati" }, 400);
    }

    const { payload, errors } = normalizeLeadBody(body as Record<string, unknown>);
    if (errors.length) {
      return json({ success: false, error: errors.join("; ") }, 400);
    }

    const lead = await addLead(payload);

    // Telegram bildirishnoma (env o'rnatilmagan bo'lsa mock rejimda log qiladi)
    const tg = await sendLeadNotification(lead);

    return json(
      {
        success: true,
        message: "Arizangiz muvaffaqiyatli qabul qilindi!",
        lead,
        telegramNotified: tg.success,
      },
      201
    );
  } catch (error) {
    console.error("Lead API Error:", error);
    return json({ success: false, error: "Serverda xatolik yuz berdi" }, 500);
  }
}

/** PATCH — faqat admin. Status / izoh yangilash. */
export async function PATCH(req: Request) {
  if (!isAuthed(req)) return json({ success: false, error: "Ruxsat yo'q" }, 401);
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ success: false, error: "Noto'g'ri so'rov formati" }, 400);
    }
    const { id, status, adminNotes } = body as {
      id?: string;
      status?: LeadStatus;
      adminNotes?: string;
    };
    if (!id) return json({ success: false, error: "Ariza ID si kerak" }, 400);

    const patch: { status?: LeadStatus; adminNotes?: string } = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return json({ success: false, error: "Noto'g'ri status" }, 400);
      }
      patch.status = status;
    }
    if (adminNotes !== undefined) {
      patch.adminNotes = String(adminNotes).slice(0, 600);
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
  if (!isAuthed(req)) return json({ success: false, error: "Ruxsat yo'q" }, 401);
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

// IP-based sodda rate-limit xotirasi
const rateMap = new Map<string, number[]>();
