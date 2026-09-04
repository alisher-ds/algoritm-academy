export interface LeadPayload {
  name: string;
  phone: string;
  type: "maktab" | "kurs" | "umumiy";
  targetInterest: string; // e.g. "5-sinf", "IELTS Intensive", "Matematika"
  preferredTime?: string;
  notes?: string;
  source?: string;
}

export async function sendLeadNotification(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const typeLabels = {
    maktab: "🏫 Xususiy Maktabga Qabul",
    kurs: "🎓 O'quv Markazi Kursi",
    umumiy: "📋 Umumiy Konsultatsiya",
  };

  const message = `
🔔 *YANGI ARIZA | ALGORITM EKOSISTEMASI*
━━━━━━━━━━━━━━━━━━━━
👤 *F.I.Sh:* ${payload.name}
📞 *Telefon:* ${payload.phone}
🎯 *Yo'nalish:* ${typeLabels[payload.type] || payload.type}
📚 *Qiziqish / Sinf / Fan:* ${payload.targetInterest || "Ko'rsatilmagan"}
⏰ *Qulay vaqt:* ${payload.preferredTime || "Ixtiyoriy"}
💬 *Qo'shimcha izoh:* ${payload.notes || "Yo'q"}
📅 *Sana:* ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
━━━━━━━━━━━━━━━━━━━━
ℹ️ _Sayt orqali yuborildi_
`;

  // If Telegram env variables are set, send to Telegram directly
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

  // If not configured, mock success for local demo
  console.log("Mock Lead Received (Configure TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID for live alerts):\n", message);
  return { success: true };
}
