/**
 * Algoritm Academy - Davomat va Guruhlar Tizimi uchun Telegram Bildirishnomalari
 */

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface AttendanceNotificationParams {
  groupName: string;
  teacherName: string;
  date: string;
  totalCount: number;
  presentCount: number;
  excusedCount: number;
  absentCount: number;
}

export async function sendAttendanceReportNotification(
  params: AttendanceNotificationParams
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const msg = [
    "📋 <b>DAVOMAT QAYD ETILDI | ALGORITM</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    `👨‍🏫 <b>Ustoz:</b> ${htmlEscape(params.teacherName)}`,
    `👥 <b>Guruh:</b> ${htmlEscape(params.groupName)}`,
    `📅 <b>Sana:</b> ${htmlEscape(params.date)}`,
    `👥 <b>Jami o'quvchilar:</b> ${params.totalCount} ta`,
    `✅ <b>Kelganlar:</b> ${params.presentCount} ta`,
    `⚠️ <b>Sababli (uzrli):</b> ${params.excusedCount} ta`,
    `❌ <b>Kelmaganlar:</b> ${params.absentCount} ta`,
    "━━━━━━━━━━━━━━━━━━━━",
    params.excusedCount > 0
      ? `💰 <i>${params.excusedCount} ta sababli dars oylik to'lov hisobidan avtomatik chegirildi.</i>`
      : "✨ <i>Barcha hisob-kitoblar va davomat vedomosti yangilandi.</i>",
  ].join("\n");

  if (!botToken || !chatId) {
    console.log("[Telegram] Bildirishnoma (Mock):\n" + msg);
    return { success: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] API xatolik:", err);
      return { success: false, error: err };
    }
    return { success: true };
  } catch (err) {
    console.error("[Telegram] Xatolik:", err);
    return { success: false, error: String(err) };
  }
}

export interface NewStudentParams {
  studentName: string;
  groupName: string;
  phone: string;
  parentPhone?: string;
  monthlyPrice?: number;
}

export async function sendNewStudentNotification(
  params: NewStudentParams
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const msg = [
    "🎓 <b>YANGI O'QUVCHI GURUHGA QO'SHILDI</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    `👤 <b>O'quvchi:</b> ${htmlEscape(params.studentName)}`,
    `👥 <b>Guruh:</b> ${htmlEscape(params.groupName)}`,
    `📞 <b>Telefon:</b> ${htmlEscape(params.phone)}`,
    params.parentPhone ? `👨‍👩‍👦 <b>Ota-onasi:</b> ${htmlEscape(params.parentPhone)}` : "",
    params.monthlyPrice
      ? `💵 <b>Oylik to'lov:</b> ${params.monthlyPrice.toLocaleString("uz-UZ")} so'm`
      : "",
    `📅 <b>Sana:</b> ${new Date().toLocaleDateString("uz-UZ")}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "ℹ️ <i>Algoritm Boshqaruv Tizimi</i>",
  ]
    .filter(Boolean)
    .join("\n");

  if (!botToken || !chatId) {
    console.log("[Telegram] Yangi o'quvchi (Mock):\n" + msg);
    return { success: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(4000),
    });

    return { success: res.ok };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export interface NewGroupParams {
  groupName: string;
  subject: string;
  teacherName: string;
  days: string;
  time: string;
  room: string;
  monthlyPrice: number;
}

export async function sendNewGroupNotification(
  params: NewGroupParams
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const msg = [
    "🏫 <b>YANGI GURUH OCHILDI | ALGORITM</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    `👥 <b>Guruh:</b> ${htmlEscape(params.groupName)}`,
    `📚 <b>Fan:</b> ${htmlEscape(params.subject)}`,
    `👨‍🏫 <b>Ustoz:</b> ${htmlEscape(params.teacherName)}`,
    `⏰ <b>Vaqti:</b> ${htmlEscape(params.time)} (${htmlEscape(params.days)})`,
    `📍 <b>Xona:</b> ${htmlEscape(params.room)}`,
    `💵 <b>Oylik to'lov:</b> ${params.monthlyPrice.toLocaleString("uz-UZ")} so'm`,
    "━━━━━━━━━━━━━━━━━━━━",
    "🚀 <i>Guruhga o'quvchilar qabul qilishga tayyor!</i>",
  ].join("\n");

  if (!botToken || !chatId) {
    console.log("[Telegram] Yangi guruh (Mock):\n" + msg);
    return { success: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(4000),
    });

    return { success: res.ok };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
