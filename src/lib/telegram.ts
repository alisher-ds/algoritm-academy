import type { LeadPayload } from "./leads";

const TYPE_LABELS: Record<LeadPayload["type"], string> = {
  maktab: "🏫 Xususiy Maktabga Qabul",
  kurs: "🎓 O'quv Markazi Kursi",
  umumiy: "📋 Umumiy Konsultatsiya",
};

/** Telegram Markdown uchun xavfsiz matn (_, *, `, [ belgilaridan tozalaydi). */
function md(value: string): string {
  return value.replace(/[_*`[\]()~>#+\-=|{}.!]/g, "\\$&");
}

export async function sendLeadNotification(
  payload: LeadPayload
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = [
    "🔔 *YANGI ARIZA | ALGORITM EKOSISTEMASI*",
    "━━━━━━━━━━━━━━━━━━━━",
    `👤 *F.I.Sh:* ${md(payload.name)}`,
    `📞 *Telefon:* ${md(payload.phone)}`,
    `🎯 *Yo'nalish:* ${TYPE_LABELS[payload.type] || md(payload.type)}`,
    `📚 *Qiziqish / Sinf / Fan:* ${md(payload.targetInterest || "Ko'rsatilmagan")}`,
    `⏰ *Qulay vaqt:* ${md(payload.preferredTime || "Ixtiyoriy")}`,
    `💬 *Izoh:* ${md(payload.notes || "Yo'q")}`,
    `📱 *Manba:* ${md(payload.source || "Sayt")}`,
    `📅 *Sana:* ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "ℹ️ _Sayt orqali yuborildi_",
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
          parse_mode: "Markdown",
        }),
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
