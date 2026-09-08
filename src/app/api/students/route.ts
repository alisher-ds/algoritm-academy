import { NextResponse } from "next/server";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getGroup,
  listGroups,
} from "@/lib/attendanceStore";
import type { StudentStatus } from "@/lib/attendanceTypes";
import { isSameOrigin } from "@/lib/adminAuth";
import { getAttendanceAuthContext, canAccessGroupId } from "@/lib/attendanceAuth";
import { normalizeUzPhone } from "@/lib/phone";
import { sendNewStudentNotification } from "@/lib/attendanceTelegram";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId") || undefined;
  const status = (searchParams.get("status") as StudentStatus) || undefined;
  const search = searchParams.get("search") || undefined;
  const id = searchParams.get("id");

  if (id) {
    const student = await getStudent(id);
    if (!student) {
      return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    }
    const hasAccess = await canAccessGroupId(auth, student.groupId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 });
    }
    return NextResponse.json({ success: true, student });
  }

  if (groupId) {
    const hasAccess = await canAccessGroupId(auth, groupId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Bu guruh ma'lumotlarini ko'rish uchun ruxsat yo'q" }, { status: 403 });
    }
    const students = await listStudents({ groupId, status, search });
    return NextResponse.json({ success: true, students });
  }

  // Guruh ko'rsatilmagan bo'lsa:
  if (auth.isAdmin) {
    const students = await listStudents({ status, search });
    return NextResponse.json({ success: true, students });
  }

  // Agar ustoz bo'lsa — faqat unga tegishli barcha guruhlarning o'quvchilari
  if (auth.teacher) {
    const allGroups = await listGroups({ activeOnly: false });
    const teacherGroupIds = new Set(
      allGroups
        .filter(
          (g) =>
            g.teacherId === auth.teacher?.id ||
            (g.teacherName && auth.teacher?.name && g.teacherName.toLowerCase() === auth.teacher.name.toLowerCase())
        )
        .map((g) => g.id)
    );
    const allStudents = await listStudents({ status, search });
    const teacherStudents = allStudents.filter((s) => teacherGroupIds.has(s.groupId));
    return NextResponse.json({ success: true, students: teacherStudents });
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

    const targetGroupId = String(body.groupId).trim();
    const hasAccess = await canAccessGroupId(auth, targetGroupId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Ushbu guruhga o'quvchi qo'shish uchun ruxsat yo'q" },
        { status: 403 }
      );
    }

    const phone = normalizeUzPhone(body.phone) || body.phone || "+998";

    const student = await createStudent({
      name: String(body.name).trim(),
      phone,
      parentPhone: body.parentPhone ? String(body.parentPhone).trim() : undefined,
      groupId: targetGroupId,
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
    console.error("[POST /api/students Error]:", error);
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
      return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
    }

    const existing = await getStudent(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const hasAccess = await canAccessGroupId(auth, existing.groupId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Ushbu o'quvchini tahrirlash uchun ruxsat yo'q" }, { status: 403 });
    }

    // Agar guruhini o'zgartirayotgan bo'lsa, yangi guruhga ham huquqi bo'lishi kerak
    if (body.groupId && body.groupId !== existing.groupId) {
      const hasNewAccess = await canAccessGroupId(auth, String(body.groupId).trim());
      if (!hasNewAccess) {
        return NextResponse.json({ success: false, error: "Yangi guruhga ko'chirish uchun ruxsat yo'q" }, { status: 403 });
      }
    }

    const updated = await updateStudent(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("[PATCH /api/students Error]:", error);
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
    return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
  }

  const existing = await getStudent(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
  }

  const hasAccess = await canAccessGroupId(auth, existing.groupId);
  if (!hasAccess) {
    return NextResponse.json({ success: false, error: "Ushbu o'quvchini o'chirish uchun ruxsat yo'q" }, { status: 403 });
  }

  const ok = await deleteStudent(id);
  if (!ok) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
  return NextResponse.json({ success: true, message: "O'quvchi o'chirildi" });
}
