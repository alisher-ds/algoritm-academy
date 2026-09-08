import { NextResponse } from "next/server";
import {
  recordAttendance,
  getAttendance,
  calculateMonthlyBilling,
  getGroup,
} from "@/lib/attendanceStore";
import { isSameOrigin } from "@/lib/adminAuth";
import { getAttendanceAuthContext, canAccessGroupId } from "@/lib/attendanceAuth";
import { verifyTelegramWebAppData } from "@/lib/telegramAuth";
import { sendAttendanceReportNotification } from "@/lib/attendanceTelegram";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await getAttendanceAuthContext(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ success: false, error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const month = searchParams.get("month"); // "2026-09"
  const date = searchParams.get("date"); // "2026-09-08"
  const billing = searchParams.get("billing") === "true";

  if (!groupId) {
    return NextResponse.json({ success: false, error: "Guruh ID si ko'rsatilmadi" }, { status: 400 });
  }

  const hasAccess = await canAccessGroupId(auth, groupId);
  if (!hasAccess) {
    return NextResponse.json({ success: false, error: "Ushbu guruh davomatini ko'rish uchun ruxsat yo'q" }, { status: 403 });
  }

  if (billing && month) {
    const billingData = await calculateMonthlyBilling(groupId, month);
    return NextResponse.json({ success: true, billing: billingData });
  }

  const records = await getAttendance(groupId, date || month || undefined);
  return NextResponse.json({ success: true, records });
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
  const limit = await rateLimit("attendance:submit:" + ip, 45, 60);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Telegram WebApp initData mavjud bo'lsa tekshiramiz
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (body.initData && token) {
      const authResult = verifyTelegramWebAppData(body.initData, token);
      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: "Xavfsizlik xatosi: Soxtalashtirilgan Telegram sessiyasi." },
          { status: 401 }
        );
      }
    }

    const records = Array.isArray(body.records) ? body.records : [];
    if (records.length === 0) {
      return NextResponse.json({ success: false, error: "Davomat yozuvlari kiritilmadi" }, { status: 400 });
    }

    // Guruhga egalik huquqini tekshirish
    for (const r of records) {
      const gId = String(r.groupId || "").trim();
      const hasAccess = await canAccessGroupId(auth, gId);
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: `Ushbu guruh (${gId}) uchun davomat kiritishga ruxsat yo'q` },
          { status: 403 }
        );
      }
    }

    const result = await recordAttendance(records);

    // Fon rejimida Telegram bildirishnomasi
    if (records.length > 0 && records[0].groupId) {
      getGroup(records[0].groupId).then((group) => {
        const presentCount = records.filter((r: { status: string }) => r.status === "keldi").length;
        const excusedCount = records.filter((r: { status: string }) => r.status === "sababli").length;
        const absentCount = records.filter((r: { status: string }) => r.status === "kelmadi").length;

        sendAttendanceReportNotification({
          groupName: group?.name || "Guruh",
          teacherName: records[0].markedBy || group?.teacherName || auth.teacher?.name || "Ustoz",
          date: records[0].date || new Date().toISOString().slice(0, 10),
          totalCount: records.length,
          presentCount,
          excusedCount,
          absentCount,
        }).catch((err) => console.error("Telegram attendance notification error:", err));
      });
    }

    return NextResponse.json({
      success: true,
      message: `${result.savedCount} ta o'quvchi davomati saqlandi`,
      count: result.savedCount,
    });
  } catch (error) {
    console.error("[POST /api/attendance Error]:", error);
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
