import { NextResponse } from "next/server";
import { listGroups, listStudents, getAttendance } from "@/lib/attendanceStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: "TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi o'rnatilmagan.",
    });
  }

  const webhookUrl = "https://algoritm-academy.vercel.app/api/telegram/webhook";
  const webAppUrl = "https://algoritm-academy.vercel.app/davomat";

  try {
    // 1. Telegramga Webhookni ulash
    const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const whData = await whRes.json().catch(() => ({}));

    // 2. Pastki chap burchakka doimiy "📋 Davomat" WebApp menyu tugmasini o'rnatish
    const btnRes = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu_button: {
          type: "web_app",
          text: "📋 Davomat",
          web_app: { url: webAppUrl },
        },
      }),
    });
    const btnData = await btnRes.json().catch(() => ({}));

    // 3. Bot buyruqlarini ro'yxatdan o'tkazish
    const cmdRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "davomat", description: "10 soniyalik Davomat (Mini App)" },
          { command: "guruhlar", description: "Faol guruhlar va jadvallar" },
          { command: "hisobot", description: "Bugungi davomat statistikasi" },
          { command: "start", description: "Botni qayta ishga tushirish" },
        ],
      }),
    });
    const cmdData = await cmdRes.json().catch(() => ({}));

    // 4. Bot ma'lumotlarini olish
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      configured: true,
      bot: meData?.result,
      webhook: whData,
      menuButton: btnData,
      commands: cmdData,
      message: "@algoritm_ustoz_bot to'liq muvaffaqiyatli sozlandi va ulandi!",
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}

async function sendTelegramReply(chatId: number | string, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error("Failed to send telegram reply:", err);
  }
}

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const message = update?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = String(message.text).trim();
    const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Ustoz";

    if (text === "/start") {
      const replyText = [
        `👋 <b>Assalomu alaykum, ${senderName}!</b>`,
        "",
        "🏛 <b>Algoritm Academy & School Boshqaruv Botiga xush kelibsiz.</b>",
        "",
        "Quyidagi imkoniyatlar mavjud:",
        "📱 /davomat — O'qituvchilar uchun 10 soniyalik mobil davomat portali",
        "👥 /guruhlar — Hozirgi barcha faol guruhlar va dars jadvallari",
        "📊 /hisobot — Bugungi darslar va davomat hisoboti",
        "",
        "Daftar tutishga chek qo'ying — barchasi raqamli va avtomatlashtirilgan!",
      ].join("\n");

      const markup = {
        inline_keyboard: [
          [
            {
              text: "📱 Mobil Davomat Portali",
              web_app: { url: "https://algoritm-academy.vercel.app/davomat" },
            },
          ],
          [
            {
              text: "🌐 Algoritm Rasmiy Sayti",
              url: "https://algoritm-academy.vercel.app",
            },
          ],
        ],
      };

      await sendTelegramReply(chatId, replyText, markup);
      return NextResponse.json({ ok: true });
    }

    if (text === "/davomat") {
      const replyText = [
        "📱 <b>O'QITUVCHILAR UCHUN TELEGRAM DAVOMAT</b>",
        "━━━━━━━━━━━━━━━━━━━━",
        "10 soniyada davomat qiling. Bitta tugma orqali darsga kelgan, uzrli sabab bilan qatnashmagan yoki kelmagan o'quvchilarni belgilang.",
        "",
        "Telegram ichida mini-ilova tarzida ochiladi (brauzerga o'tish talab etilmaydi):",
      ].join("\n");

      await sendTelegramReply(chatId, replyText, {
        inline_keyboard: [
          [
            {
              text: "📋 Davomat Qilish (Mini App)",
              web_app: { url: "https://algoritm-academy.vercel.app/davomat" },
            },
          ],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    if (text === "/guruhlar") {
      const groups = await listGroups({ activeOnly: true });
      const students = await listStudents({ status: "faol" });

      const lines = [
        "👥 <b>ALGORITM ACADEMY | FAOL GURUHLAR</b>",
        "━━━━━━━━━━━━━━━━━━━━",
      ];

      if (groups.length === 0) {
        lines.push("Hozircha tizimda faol guruhlar mavjud emas.");
      } else {
        groups.forEach((g, idx) => {
          const stCount = students.filter((s) => s.groupId === g.id).length;
          lines.push(`<b>${idx + 1}. ${g.name}</b> (${g.subject})`);
          lines.push(`   👨‍🏫 Ustoz: ${g.teacherName}`);
          lines.push(`   ⏰ Vaqt: ${g.time} (${g.days}) | ${g.room}`);
          lines.push(`   👥 O'quvchilar: <b>${stCount}</b> ta`);
          lines.push(`   💵 Oylik: ${g.monthlyPrice.toLocaleString("uz-UZ")} so\'m`);
          lines.push("");
        });
      }

      lines.push("━━━━━━━━━━━━━━━━━━━━");
      lines.push("🔗 Yangi guruh ochish: Admin panel orqali");

      await sendTelegramReply(chatId, lines.join("\n"));
      return NextResponse.json({ ok: true });
    }

    if (text === "/hisobot") {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const groups = await listGroups({ activeOnly: true });

      const lines = [
        `📊 <b>BUGUNGI DAVOMAT HISOBOTI (${todayStr})</b>`,
        "━━━━━━━━━━━━━━━━━━━━",
      ];

      let totalMarked = 0;
      let totalKeldi = 0;
      let totalSababli = 0;
      let totalKelmadi = 0;

      for (const g of groups) {
        const recs = await getAttendance(g.id, todayStr);
        if (recs.length > 0) {
          const k = recs.filter((r) => r.status === "keldi").length;
          const s = recs.filter((r) => r.status === "sababli").length;
          const km = recs.filter((r) => r.status === "kelmadi").length;
          lines.push(`🔹 <b>${g.name}</b> (${g.teacherName}):`);
          lines.push(`   ✅ Keldi: ${k} | ⚠️ Sababli: ${s} | ❌ Kelmadi: ${km}`);
          totalMarked += recs.length;
          totalKeldi += k;
          totalSababli += s;
          totalKelmadi += km;
        }
      }

      if (totalMarked === 0) {
        lines.push("Bugun hali hech bir guruh davomati belgilanmadi.");
      } else {
        lines.push("━━━━━━━━━━━━━━━━━━━━");
        lines.push(`📈 <b>Jami qayd etilgan:</b> ${totalMarked} ta`);
        lines.push(`✅ Kelganlar: ${totalKeldi}`);
        lines.push(`⚠️ Sababli (uzrli): ${totalSababli}`);
        lines.push(`❌ Kelmaganlar: ${totalKelmadi}`);
      }

      await sendTelegramReply(chatId, lines.join("\n"));
      return NextResponse.json({ ok: true });
    }

    // Noma'lum buyruq kelganda
    await sendTelegramReply(
      chatId,
      "Tushunarsiz buyruq. Quyidagilardan birini tanlang:\n/davomat — Mobil portal\n/guruhlar — Guruhlar ro'yxati\n/hisobot — Bugungi davomat"
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
