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

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

  if (auth.teacher) {
    const allGroups = await listGroups({ activeOnly });
    const teacherGroups = allGroups.filter((g) => canAccessGroup(auth, g));
    return NextResponse.json({ success: true, groups: teacherGroups });
  }

  return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 });
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }

  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  if (!auth.isAdmin && auth.teacher?.status && auth.teacher.status !== "active") {
    return NextResponse.json({ success: false, error: "Hisobingiz hali tasdiqlanmagan yoki faol emas" }, { status: 403 });
  }

  const { key: ip } = clientIdentity(req);
  const limit = await rateLimit("group:create:" + ip, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Guruh nomi majburiy" },
        { status: 400 }
      );
    }

    // Ustoz bo'lsa majburiy uning o'z ma'lumotlari biriktiriladi
    const effectiveTeacherId = auth.isAdmin
      ? String(body.teacherId || ("tm-" + Date.now())).trim()
      : auth.teacher!.id;

    const effectiveTeacherName = auth.isAdmin
      ? String(body.teacherName || "Algoritm Ustoz").trim()
      : auth.teacher!.name;

    const newGroup = await createGroup({
      name: String(body.name).trim(),
      subject: String(body.subject || (auth.teacher?.subject ?? "Umumiy fan")).trim(),
      teacherId: effectiveTeacherId,
      teacherName: effectiveTeacherName,
      days: body.days || "dush-chor-juma",
      time: String(body.time || "14:00 - 15:30").trim(),
      room: String(body.room || "Asosiy bino").trim(),
      monthlyPrice: Number(body.monthlyPrice) || 450000,
      lessonsPerMonth: Number(body.lessonsPerMonth) || 12,
      active: body.active !== false,
    });

    // Telegram bildirishnomasi
    sendNewGroupNotification({
      groupName: newGroup.name,
      subject: newGroup.subject,
      teacherName: newGroup.teacherName,
      days: newGroup.days,
      time: newGroup.time,
      room: newGroup.room,
      monthlyPrice: newGroup.monthlyPrice,
    }).catch((e) => console.error("Telegram group notify failed:", e));

    return NextResponse.json({ success: true, group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 });
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
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });
    }

    const existing = await getGroup(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    }

    if (!canAccessGroup(auth, existing)) {
      return NextResponse.json({ success: false, error: "Ushbu guruhni tahrirlash uchun ruxsat yo'q" }, { status: 403 });
    }

    // Ustoz boshqa ustozga o'tkaza olmaydi
    const patch = { ...body };
    if (!auth.isAdmin) {
      delete patch.teacherId;
      delete patch.teacherName;
    }

    const updated = await updateGroup(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ success: true, group: updated });
  } catch (error) {
    console.error("[PATCH /api/groups Error]:", error);
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 });
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });
  }

  const existing = await getGroup(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
  }

  if (!canAccessGroup(auth, existing)) {
    return NextResponse.json({ success: false, error: "Ushbu guruhni o'chirish uchun ruxsat yo'q" }, { status: 403 });
  }

  const ok = await deleteGroup(id);
  if (!ok) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Guruh o'chirildi" });
}
