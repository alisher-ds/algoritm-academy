import { NextResponse } from "next/server";
import { listGroups, listStudents, getAttendance } from "@/lib/attendanceStore";
import { findTeacherByTelegram } from "@/lib/teacherAuth";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://algoritm-academy.vercel.app";
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: "TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi o'rnatilmagan.",
    });
  }

  const baseUrl = getBaseUrl();
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  const webAppUrl = `${baseUrl}/davomat`;

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
  // Webhook secret token tekshiruvi (agar sozlagan bo'lsa)
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (receivedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
  }
  try {
    const update = await req.json();
    const message = update?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const baseUrl = getBaseUrl();
    const chatId = message.chat.id;
    const text = String(message.text).trim();
    const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Foydalanuvchi";

    // Qat'iy Xavfsizlik: Ushbu Telegram foydalanuvchisi Algoritm o'qituvchisimi?
    const teacher = await findTeacherByTelegram(chatId, message.from?.username);
    const isAdmin = Boolean(process.env.TELEGRAM_CHAT_ID && String(process.env.TELEGRAM_CHAT_ID) === String(chatId));

    if (text === "/start") {
      if (teacher) {
        // Tizimda tasdiqlangan ustoz uchun shaxsiy xush kelibsiz xabari
        const replyText = [
          `👋 <b>Assalomu alaykum, ${teacher.name}!</b>`,
          "",
          "🏛 <b>Algoritm Ustoz Boshqaruv Markazi</b>",
          `Mutaxassislik: <b>${teacher.subject}</b>`,
          "",
          "Quyidagi imkoniyatlar mavjud:",
          "📱 /davomat — 5 soniyada dars davomati qilish (Mini App)",
          "👥 /guruhlar — Sizga biriktirilgan faol guruhlar",
          "📊 /hisobot — Bugungi darslaringiz davomat statistikasi",
        ].join("\n");

        const markup = {
          inline_keyboard: [
            [
              {
                text: "📋 Davomat Qilish (Mini App)",
                web_app: { url: `${baseUrl}/davomat` },
              },
            ],
            [
              {
                text: "👥 Mening Guruhlarim",
                callback_data: "my_groups",
              },
            ],
          ],
        };

        await sendTelegramReply(chatId, replyText, markup);
        return NextResponse.json({ ok: true });
      }

      // Begona / Yangi foydalanuvchi uchun cheklangan xush kelibsiz xabari
      const guestText = [
        `👋 <b>Assalomu alaykum, ${senderName}!</b>`,
        "",
        "🏛 <b>Algoritm Academy & School</b> rasmiy xodimlar va ustozlar botiga xush kelibsiz.",
        "",
        "⚠️ <i>Ushbu bot faqat Algoritm xodimlari va o'qituvchilari uchun mo'ljallangan. Ichki guruhlar va ma'lumotlar begonalarga berilmaydi.</i>",
        "",
        "Agar siz Algoritm o'qituvchisi bo'lsangiz, avval portaldan ro'yxatdan o'ting va parolingizni belgilang:",
      ].join("\n");

      const guestMarkup = {
        inline_keyboard: [
          [
            {
              text: "🔐 Ustoz Portali (Kirish / Ro'yxatdan o'tish)",
              web_app: { url: `${baseUrl}/davomat` },
            },
          ],
          [
            {
              text: "🌐 Algoritm Rasmiy Sayti",
              url: baseUrl,
            },
          ],
        ],
      };

      await sendTelegramReply(chatId, guestText, guestMarkup);
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
              web_app: { url: `${baseUrl}/davomat` },
            },
          ],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    if (text === "/guruhlar") {
      if (!teacher && !isAdmin) {
        await sendTelegramReply(
          chatId,
          "⛔️ <b>Ruxsat cheklangan</b>\n\nGuruhlar ro'yxati va dars jadvali faqat Algoritm xodimlari va tasdiqlangan ustozlari uchun ochiq.\n\nAgar siz markaz ustozi bo'lsangiz, avval portaldan ro'yxatdan o'ting:",
          {
            inline_keyboard: [
              [
                {
                  text: "🔐 Ustoz Portali (Kirish / Ro'yxatdan o'tish)",
                  web_app: { url: `${baseUrl}/davomat` },
                },
              ],
            ],
          }
        );
        return NextResponse.json({ ok: true });
      }

      const allGroups = await listGroups({ activeOnly: true });
      const groups = isAdmin ? allGroups : allGroups.filter((g) => g.teacherId === teacher?.id);
      const students = await listStudents({ status: "faol" });

      const lines = [
        `👥 <b>${isAdmin ? "BARCHA FAOL GURUHLAR" : "SIZGA BIRIKTIRILGAN GURUHLAR"}</b>`,
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
      if (!teacher && !isAdmin) {
        await sendTelegramReply(
          chatId,
          "⛔️ <b>Ruxsat cheklangan</b>\n\nDavomat statistikasi faqat Algoritm xodimlari va ustozlari uchun ochiq."
        );
        return NextResponse.json({ ok: true });
      }
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const allGroups = await listGroups({ activeOnly: true });
      const groups = isAdmin ? allGroups : allGroups.filter((g) => g.teacherId === teacher?.id);

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
