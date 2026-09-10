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
import { getAttendanceAuthContext, canAccessGroupId, canAccessGroup } from "@/lib/attendanceAuth";
import { sendNewStudentNotification } from "@/lib/attendanceTelegram";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";
import { isStatus, normalizeRequiredPhone, text } from "@/lib/attendanceValidation";

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

function parseStudentFields(body: Record<string, unknown>, existing?: { groupId: string }) {
  const name = text(body.name, 120);
  const rawPhone = body.phone;
  const phone = normalizeRequiredPhone(rawPhone);
  const parentPhoneValue = body.parentPhone;
  const parentPhone: string | undefined =
    parentPhoneValue === undefined || parentPhoneValue === null || parentPhoneValue === ""
      ? undefined
      : normalizeRequiredPhone(parentPhoneValue) || undefined;
  const groupId = text(body.groupId || existing?.groupId, 64);
  const status = body.status === undefined ? "faol" : body.status;
  const notes = body.notes === undefined || body.notes === null ? undefined : text(body.notes, 500);

  if (name.length < 2 || !/\p{L}/u.test(name)) return { error: "O'quvchi ism-familiyasi kamida 2 ta harfdan iborat bo'lishi kerak" };
  if (!phone) return { error: "O'quvchi telefon raqami noto'g'ri yoki kiritilmadi" };
  if (body.parentPhone !== undefined && body.parentPhone !== null && body.parentPhone !== "" && !parentPhone) {
    return { error: "Ota-ona telefon raqami noto'g'ri" };
  }
  if (!groupId) return { error: "Guruh ID si majburiy" };
  if (!isStatus(status)) return { error: "O'quvchi statusi noto'g'ri" };

  return {
    value: {
      name,
      phone,
      parentPhone,
      groupId,
      status: status as StudentStatus,
      notes,
    },
  };
}

export async function GET(req: Request) {
  try {
    const auth = await getAttendanceAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId") || undefined;
    const rawStatus = searchParams.get("status");
    if (rawStatus !== null && !isStatus(rawStatus)) {
      return NextResponse.json({ success: false, error: "O'quvchi statusi noto'g'ri" }, { status: 400 });
    }
    const status = rawStatus || undefined;
    const search = searchParams.get("search") || undefined;
    const id = searchParams.get("id");

    if (id) {
      const student = await getStudent(id);
      if (!student) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
      if (!(await canAccessGroupId(auth, student.groupId))) {
        return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 });
      }
      return NextResponse.json({ success: true, student });
    }

    if (groupId) {
      if (!(await canAccessGroupId(auth, groupId))) {
        return NextResponse.json({ success: false, error: "Bu guruh ma'lumotlarini ko'rish uchun ruxsat yo'q" }, { status: 403 });
      }
      const students = await listStudents({ groupId, status, search });
      return NextResponse.json({ success: true, students });
    }

    if (auth.isAdmin) {
      return NextResponse.json({ success: true, students: await listStudents({ status, search }) });
    }

    const allGroups = await listGroups({ activeOnly: false });
    const teacherGroupIds = new Set(
      allGroups.filter((g) => canAccessGroup(auth, g)).map((g) => g.id)
    );
    const allStudents = await listStudents({ status, search });
    return NextResponse.json({
      success: true,
      students: allStudents.filter((student) => teacherGroupIds.has(student.groupId)),
    });
  } catch (error) {
    console.error("[GET /api/students Error]:", error);
    return NextResponse.json({ success: false, error: "O'quvchilarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  if (!auth.isAdmin && auth.teacher?.status !== "active") {
    return NextResponse.json({ success: false, error: "Hisobingiz hali tasdiqlanmagan yoki faol emas" }, { status: 403 });
  }

  const limit = await rateLimit("student:create:" + clientIdentity(req).key, 30, 60);
  if (!limit.allowed) return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });

  try {
    const body = await readBody(req);
    if (!body) return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });
    const parsed = parseStudentFields(body);
    if (parsed.error || !parsed.value) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

    const group = await getGroup(parsed.value.groupId);
    if (!group) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    if (!canAccessGroup(auth, group)) return NextResponse.json({ success: false, error: "Ushbu guruhga o'quvchi qo'shish uchun ruxsat yo'q" }, { status: 403 });

    const student = await createStudent(parsed.value);
    void sendNewStudentNotification({
      studentName: student.name,
      groupName: group.name,
      phone: student.phone,
      parentPhone: student.parentPhone,
      monthlyPrice: group.monthlyPrice,
    }).catch((error) => console.error("Telegram notify failed:", error));
    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/students Error]:", error);
    return NextResponse.json({ success: false, error: "O'quvchini yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

  try {
    const body = await readBody(req);
    if (!body) return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });
    const id = text(body.id, 64);
    if (!id) return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
    const existing = await getStudent(id);
    if (!existing) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    if (!(await canAccessGroupId(auth, existing.groupId))) {
      return NextResponse.json({ success: false, error: "Ushbu o'quvchini tahrirlash uchun ruxsat yo'q" }, { status: 403 });
    }

    const merged = { ...existing, ...body };
    const parsed = parseStudentFields(merged, existing);
    if (parsed.error || !parsed.value) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    const newGroup = await getGroup(parsed.value.groupId);
    if (!newGroup) return NextResponse.json({ success: false, error: "Yangi guruh topilmadi" }, { status: 404 });
    if (!(await canAccessGroupId(auth, newGroup.id))) {
      return NextResponse.json({ success: false, error: "Yangi guruhga ko'chirish uchun ruxsat yo'q" }, { status: 403 });
    }

    const updated = await updateStudent(id, parsed.value);
    return updated
      ? NextResponse.json({ success: true, student: updated })
      : NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
  } catch (error) {
    console.error("[PATCH /api/students Error]:", error);
    return NextResponse.json({ success: false, error: "O'quvchini tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

  try {
    const id = text(new URL(req.url).searchParams.get("id"), 64);
    if (!id) return NextResponse.json({ success: false, error: "O'quvchi ID si kerak" }, { status: 400 });
    const existing = await getStudent(id);
    if (!existing) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
    if (!(await canAccessGroupId(auth, existing.groupId))) {
      return NextResponse.json({ success: false, error: "Ushbu o'quvchini o'chirish uchun ruxsat yo'q" }, { status: 403 });
    }
    const ok = await deleteStudent(id);
    return ok
      ? NextResponse.json({ success: true, message: "O'quvchi o'chirildi" })
      : NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
  } catch (error) {
    console.error("[DELETE /api/students Error]:", error);
    return NextResponse.json({ success: false, error: "O'quvchini o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
