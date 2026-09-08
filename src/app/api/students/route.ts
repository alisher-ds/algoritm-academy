import { NextResponse } from "next/server";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getGroup,
} from "@/lib/attendanceStore";
import { isSameOrigin } from "@/lib/adminAuth";
import { normalizeUzPhone } from "@/lib/phone";
import { sendNewStudentNotification } from "@/lib/attendanceTelegram";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId") || undefined;
  const status = (searchParams.get("status") as any) || undefined;
  const search = searchParams.get("search") || undefined;
  const id = searchParams.get("id");

  if (id) {
    const student = await getStudent(id);
    if (!student) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    return NextResponse.json({ success: true, student });
  }

  const students = await listStudents({ groupId, status, search });
  return NextResponse.json({ success: true, students });
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }

  const { key: ip } = clientIdentity(req);
  const limit = await rateLimit("student:create:" + ip, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.groupId) {
      return NextResponse.json(
        { success: false, error: "O'quvchi ismi va guruhi majburiy" },
        { status: 400 }
      );
    }

    const phone = normalizeUzPhone(body.phone) || body.phone || "+998";

    const student = await createStudent({
      name: String(body.name).trim(),
      phone,
      parentPhone: body.parentPhone ? String(body.parentPhone).trim() : undefined,
      groupId: String(body.groupId).trim(),
      status: body.status || "faol",
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    // Fon rejimida Telegram bildirishnomasi
    getGroup(student.groupId).then((group) => {
      sendNewStudentNotification({
        studentName: student.name,
        groupName: group?.name || "Yangi guruh",
        phone: student.phone,
        parentPhone: student.parentPhone,
        monthlyPrice: group?.monthlyPrice,
      }).catch((e) => console.error("Telegram notify failed:", e));
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
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
      return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
    }
    const updated = await updateStudent(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ success: true, student: updated });
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
    return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
  }
  const ok = await deleteStudent(id);
  if (!ok) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
  return NextResponse.json({ success: true, message: "O'quvchi o'chirildi" });
}
