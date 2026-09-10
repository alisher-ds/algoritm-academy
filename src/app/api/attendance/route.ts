import { NextResponse } from "next/server";
import {
  recordAttendance,
  getAttendance,
  calculateMonthlyBilling,
  getGroup,
  getStudent,
} from "@/lib/attendanceStore";
import { isSameOrigin } from "@/lib/adminAuth";
import { getAttendanceAuthContext, canAccessGroupId } from "@/lib/attendanceAuth";
import { verifyTelegramWebAppData } from "@/lib/telegramAuth";
import { sendAttendanceReportNotification } from "@/lib/attendanceTelegram";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";
import {
  isAttendanceStatus,
  isValidDate,
  isValidMonth,
  text,
} from "@/lib/attendanceValidation";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 128 * 1024;
const MAX_RECORDS = 500;

type RawRecord = Record<string, unknown>;

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const raw = await req.text().catch(() => "");
  if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getAttendanceAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = text(searchParams.get("groupId"), 64);
    const month = searchParams.get("month");
    const date = searchParams.get("date");
    const billing = searchParams.get("billing") === "true";
    if (!groupId) return NextResponse.json({ success: false, error: "Guruh ID si ko'rsatilmadi" }, { status: 400 });
    if (month !== null && !isValidMonth(month)) return NextResponse.json({ success: false, error: "Oy formati YYYY-MM bo'lishi kerak" }, { status: 400 });
    if (date !== null && !isValidDate(date)) return NextResponse.json({ success: false, error: "Sana formati YYYY-MM-DD bo'lishi kerak" }, { status: 400 });

    const group = await getGroup(groupId);
    if (!group) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
    if (!(await canAccessGroupId(auth, groupId))) {
      return NextResponse.json({ success: false, error: "Ushbu guruh davomatini ko'rish uchun ruxsat yo'q" }, { status: 403 });
    }

    if (billing) {
      if (!month) return NextResponse.json({ success: false, error: "Hisob-kitob uchun oy ko'rsatilishi kerak" }, { status: 400 });
      const billingData = await calculateMonthlyBilling(groupId, month);
      return NextResponse.json({ success: true, billing: billingData });
    }

    const records = await getAttendance(groupId, date || month || undefined);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("[GET /api/attendance Error]:", error);
    return NextResponse.json({ success: false, error: "Davomatni yuklashda xatolik" }, { status: 500 });
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

  const limit = await rateLimit("attendance:submit:" + clientIdentity(req).key, 45, 60);
  if (!limit.allowed) return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });

  try {
    const body = await readBody(req);
    if (!body) return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });

    // initData yuborilgan bo'lsa, u haqiqiy Telegram WebApp ma'lumoti bo'lishi shart.
    // Token yo'q holatda soxta initData ni shunchaki e'tiborsiz qoldirish noto'g'ri xavfsizlik signalidir.
    if (body.initData !== undefined && body.initData !== null && body.initData !== "") {
      if (typeof body.initData !== "string") {
        return NextResponse.json({ success: false, error: "Telegram sessiyasi formati noto'g'ri" }, { status: 400 });
      }
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const authResult = token ? verifyTelegramWebAppData(body.initData, token) : { valid: false };
      if (!authResult.valid) {
        return NextResponse.json({ success: false, error: "Xavfsizlik xatosi: Telegram sessiyasi tasdiqlanmadi" }, { status: 401 });
      }
    }

    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json({ success: false, error: "Davomat yozuvlari kiritilmadi" }, { status: 400 });
    }
    if (body.records.length > MAX_RECORDS) {
      return NextResponse.json({ success: false, error: `Bir so'rovda ko'pi bilan ${MAX_RECORDS} ta yozuv yuborish mumkin` }, { status: 413 });
    }

    const records: Array<{
      groupId: string;
      studentId: string;
      date: string;
      status: "keldi" | "kelmadi" | "sababli";
      note?: string;
      markedBy: string;
    }> = [];
    const seen = new Set<string>();
    let groupId = "";

    for (const raw of body.records as unknown[]) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ success: false, error: "Davomat yozuvi noto'g'ri formatda" }, { status: 400 });
      }
      const item = raw as RawRecord;
      const currentGroupId = text(item.groupId, 64);
      const studentId = text(item.studentId, 64);
      const date = item.date;
      const status = item.status;
      if (!currentGroupId || !studentId || !isValidDate(date) || !isAttendanceStatus(status)) {
        return NextResponse.json({ success: false, error: "Guruh, o'quvchi, sana yoki status noto'g'ri" }, { status: 400 });
      }
      if (!groupId) groupId = currentGroupId;
      if (groupId !== currentGroupId) {
        return NextResponse.json({ success: false, error: "Bir so'rovda faqat bitta guruh davomati yuboriladi" }, { status: 400 });
      }
      const uniqueKey = `${currentGroupId}:${studentId}:${date}`;
      if (seen.has(uniqueKey)) {
        return NextResponse.json({ success: false, error: "Bir o'quvchi uchun takroriy davomat yozuvi yuborildi" }, { status: 400 });
      }
      seen.add(uniqueKey);

      const group = await getGroup(currentGroupId);
      if (!group) return NextResponse.json({ success: false, error: "Guruh topilmadi" }, { status: 404 });
      if (!(await canAccessGroupId(auth, currentGroupId))) {
        return NextResponse.json({ success: false, error: `Ushbu guruh (${currentGroupId}) uchun ruxsat yo'q` }, { status: 403 });
      }
      const student = await getStudent(studentId);
      if (!student) return NextResponse.json({ success: false, error: "O'quvchi topilmadi" }, { status: 404 });
      if (student.groupId !== currentGroupId) {
        return NextResponse.json({ success: false, error: "O'quvchi ushbu guruhga tegishli emas" }, { status: 400 });
      }

      const note = item.note === undefined || item.note === null ? undefined : text(item.note, 300) || undefined;
      records.push({
        groupId: currentGroupId,
        studentId,
        date,
        status,
        note,
        // Client yuborgan markedBy ga ishonmaymiz; hisobotda haqiqiy sessiya egasi ko'rsatiladi.
        markedBy: auth.isAdmin ? "Admin" : auth.teacher?.name || "Ustoz",
      });
    }

    const result = await recordAttendance(records);
    const firstGroup = await getGroup(groupId);
    const presentCount = records.filter((r) => r.status === "keldi").length;
    const excusedCount = records.filter((r) => r.status === "sababli").length;
    const absentCount = records.filter((r) => r.status === "kelmadi").length;
    void sendAttendanceReportNotification({
      groupName: firstGroup?.name || "Guruh",
      teacherName: records[0].markedBy,
      date: records[0].date,
      totalCount: records.length,
      presentCount,
      excusedCount,
      absentCount,
    }).catch((error) => console.error("Telegram attendance notification error:", error));

    return NextResponse.json({ success: true, message: `${result.savedCount} ta o'quvchi davomati saqlandi`, count: result.savedCount });
  } catch (error) {
    console.error("[POST /api/attendance Error]:", error);
    return NextResponse.json({ success: false, error: "Davomatni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
