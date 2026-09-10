import { NextResponse } from "next/server";
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/lib/attendanceStore";
import { isSameOrigin } from "@/lib/adminAuth";
import { getAttendanceAuthContext, canAccessGroup } from "@/lib/attendanceAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";
import { sendNewGroupNotification } from "@/lib/attendanceTelegram";
import {
  DAY_SCHEDULES,
  isDaySchedule,
  isPositiveInteger,
  isPositiveMoney,
  text,
} from "@/lib/attendanceValidation";
import type { DaySchedule, Group } from "@/lib/attendanceTypes";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 16 * 1024;

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const raw = await req.text().catch(() => "");
  if (!raw || raw.length > MAX_BODY_BYTES) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function groupFields(body: Record<string, unknown>, teacherId: string, teacherName: string, subjectDefault: string) {
  const name = text(body.name, 120);
  const subject = text(body.subject || subjectDefault, 120);
  const days = body.days === undefined ? "dush-chor-juma" : body.days;
  const time = text(body.time || "14:00 - 15:30", 64);
  const room = text(body.room || "Asosiy bino", 64);
  const monthlyPrice = body.monthlyPrice === undefined ? 450000 : Number(body.monthlyPrice);
  const lessonsPerMonth = body.lessonsPerMonth === undefined ? 12 : Number(body.lessonsPerMonth);
  const active = body.active === undefined ? true : body.active;

  if (name.length < 2) return { error: "Guruh nomi kamida 2 ta belgidan iborat bo'lishi kerak" };
  if (typeof active !== "boolean") return { error: "Guruh faolligi noto'g'ri ko'rsatilgan" };
  if (subject.length < 2) return { error: "Fan nomi majburiy" };
  if (!isDaySchedule(days)) return { error: `Dars kunlari noto'g'ri. Ruxsat etilgan qiymatlar: ${DAY_SCHEDULES.join(", ")}` };
  if (!time) return { error: "Dars vaqti majburiy" };
  if (!room) return { error: "Xona yoki bino nomi majburiy" };
  if (!isPositiveMoney(monthlyPrice)) return { error: "Oylik to'lov musbat va to'g'ri son bo'lishi kerak" };
  if (!isPositiveInteger(lessonsPerMonth, 31)) return { error: "Oylik darslar soni 1–31 oralig'ida bo'lishi kerak" };

  return {
    value: {
      name,
      subject,
      teacherId,
      teacherName,
      days: days as DaySchedule,
      time,
      room,
      monthlyPrice,
      lessonsPerMonth,
      active,
    } satisfies Omit<Group, "id" | "createdAt">,
  };
}

export async function GET(req: Request) {
  try {
    const auth = await getAttendanceAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const id = searchParams.get("id");

    if (id) {
      const group = await getGroup(id);
      if (!group) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
      if (!canAccessGroup(auth, group)) {
        return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 });
      }
      return NextResponse.json({ success: true, group });
    }

    if (auth.isAdmin) {
      const groups = await listGroups({ teacherId, activeOnly });
      return NextResponse.json({ success: true, groups });
    }

    const allGroups = await listGroups({ activeOnly });
    const teacherGroups = allGroups.filter((g) => canAccessGroup(auth, g));
    return NextResponse.json({ success: true, groups: teacherGroups });
  } catch (error) {
    console.error("[GET /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Guruhlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }

  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }
  if (!auth.isAdmin && auth.teacher?.status !== "active") {
    return NextResponse.json({ success: false, error: "Hisobingiz hali tasdiqlanmagan yoki faol emas" }, { status: 403 });
  }

  const { key: ip } = clientIdentity(req);
  const limit = await rateLimit("group:create:" + ip, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  try {
    const body = await readBody(req);
    if (!body) return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });

    const teacherId = auth.isAdmin ? text(body.teacherId, 64) : auth.teacher!.id;
    const teacherName = auth.isAdmin ? text(body.teacherName, 120) : auth.teacher!.name;
    if (!teacherId || !teacherName) {
      return NextResponse.json({ success: false, error: "Ustoz ma'lumotlari majburiy" }, { status: 400 });
    }

    const parsed = groupFields(body, teacherId, teacherName, auth.teacher?.subject || "Umumiy fan");
    if (parsed.error || !parsed.value) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const newGroup = await createGroup(parsed.value);
    void sendNewGroupNotification({
      groupName: newGroup.name,
      subject: newGroup.subject,
      teacherName: newGroup.teacherName,
      days: newGroup.days,
      time: newGroup.time,
      room: newGroup.room,
      monthlyPrice: newGroup.monthlyPrice,
    }).catch((error) => console.error("Telegram group notify failed:", error));

    return NextResponse.json({ success: true, group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Guruhni yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  try {
    const body = await readBody(req);
    if (!body) return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });
    const id = text(body.id, 64);
    if (!id) return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });

    const existing = await getGroup(id);
    if (!existing) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    if (!canAccessGroup(auth, existing)) {
      return NextResponse.json({ success: false, error: "Ushbu guruhni tahrirlash uchun ruxsat yo'q" }, { status: 403 });
    }

    const teacherId = auth.isAdmin ? text(body.teacherId || existing.teacherId, 64) : existing.teacherId;
    const teacherName = auth.isAdmin ? text(body.teacherName || existing.teacherName, 120) : existing.teacherName;
    const parsed = groupFields(
      { ...existing, ...body },
      teacherId,
      teacherName,
      auth.teacher?.subject || existing.subject
    );
    if (parsed.error || !parsed.value) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const updated = await updateGroup(id, parsed.value);
    return NextResponse.json({ success: true, group: updated });
  } catch (error) {
    console.error("[PATCH /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Guruhni tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  try {
    const id = text(new URL(req.url).searchParams.get("id"), 64);
    if (!id) return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });
    const existing = await getGroup(id);
    if (!existing) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    if (!canAccessGroup(auth, existing)) {
      return NextResponse.json({ success: false, error: "Ushbu guruhni o'chirish uchun ruxsat yo'q" }, { status: 403 });
    }
    const ok = await deleteGroup(id);
    return ok
      ? NextResponse.json({ success: true, message: "Guruh o'chirildi" })
      : NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
  } catch (error) {
    console.error("[DELETE /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Guruhni o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
