import type { LeadPayload } from "./leads";

const TYPE_LABELS: Record<LeadPayload["type"], string> = {
  maktab: "🏫 Xususiy Maktabga Qabul",
  kurs: "🎓 O'quv Markazi Kursi",
  umumiy: "📋 Umumiy Konsultatsiya",
};

/** Telegram HTML formati uchun xavfsiz matn (&, <, > belgilarini almashtiradi). */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendLeadNotification(
  payload: LeadPayload
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = [
    "🔔 <b>YANGI ARIZA | ALGORITM EKOSISTEMASI</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    `👤 <b>F.I.Sh:</b> ${htmlEscape(payload.name)}`,
    `📞 <b>Telefon:</b> ${htmlEscape(payload.phone)}`,
    `🎯 <b>Yo'nalish:</b> ${htmlEscape(TYPE_LABELS[payload.type] || payload.type)}`,
    `📚 <b>Qiziqish / Sinf / Fan:</b> ${htmlEscape(payload.targetInterest || "Ko'rsatilmagan")}`,
    `⏰ <b>Qulay vaqt:</b> ${htmlEscape(payload.preferredTime || "Ixtiyoriy")}`,
    `💬 <b>Izoh:</b> ${htmlEscape(payload.notes || "Yo'q")}`,
    `📱 <b>Manba:</b> ${htmlEscape(payload.source || "Sayt")}`,
    `📅 <b>Sana:</b> ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "ℹ️ <i>Sayt orqali yuborildi</i>",
  ].join("\n");

  // Telegram env o'rnatilgan bo'lsa — to'g'ridan-to'g'ri yuboramiz
  if (botToken && chatId) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Telegram API Error:", errText);
        return { success: false, error: errText };
      }
      return { success: true };
    } catch (err) {
      console.error("Failed to send telegram notification:", err);
      return { success: false, error: String(err) };
    }
  }

  // Env o'rnatilmagan bo'lsa — ma'lumot .data/leads.json da saqlanadi (mock log)
  console.log(
    "[Telegram] Bildirishnoma yuborilmadi — TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID o'rnating.\nAriza serverda saqlandi:",
    payload.name,
    payload.phone
  );
  return { success: false, error: "Telegram env o'rnatilmagan" };
}
