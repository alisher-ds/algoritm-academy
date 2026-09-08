import { NextResponse } from "next/server";
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/lib/attendanceStore";
import { isSameOrigin } from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";
import { sendNewGroupNotification } from "@/lib/attendanceTelegram";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId") || undefined;
  const activeOnly = searchParams.get("activeOnly") !== "false";
  const id = searchParams.get("id");

  if (id) {
    const group = await getGroup(id);
    if (!group) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    return NextResponse.json({ success: true, group });
  }

  const groups = await listGroups({ teacherId, activeOnly });
  return NextResponse.json({ success: true, groups });
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  const { key: ip } = clientIdentity(req);
  const limit = await rateLimit("group:create:" + ip, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.teacherName) {
      return NextResponse.json(
        { success: false, error: "Guruh nomi va ustoz ismi majburiy" },
        { status: 400 }
      );
    }

    const newGroup = await createGroup({
      name: String(body.name).trim(),
      subject: String(body.subject || "Umumiy fan").trim(),
      teacherId: String(body.teacherId || ("tm-" + Date.now())).trim(),
      teacherName: String(body.teacherName).trim(),
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
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });
    }
    const updated = await updateGroup(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ success: true, group: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Guruh ID si kerak" }, { status: 400 });
  }
  const ok = await deleteGroup(id);
  if (!ok) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Guruh o'chirildi" });
}
