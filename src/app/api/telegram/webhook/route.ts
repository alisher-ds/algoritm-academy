import { NextResponse } from "next/server";
import { listGroups, listStudents, getAttendance } from "@/lib/attendanceStore";
import { findTeacherByTelegram, verifyTeacherCredentials, bindTeacherTelegram } from "@/lib/teacherAuth";
import { isAuthed, isSameOrigin } from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://algoritm-academy.vercel.app";
}

function htmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

interface TelegramMessage {
  chat: { id: number | string };
  text?: string;
  from?: { id?: number | string; first_name?: string; last_name?: string; username?: string };
}

interface TelegramUpdate {
  message?: TelegramMessage;
  callback_query?: {
    id?: string;
    data?: string;
    from?: TelegramMessage["from"];
    message?: TelegramMessage;
  };
}

function isCommand(text: string, command: string): boolean {
  const token = text.trim().split(/\s+/, 1)[0].toLowerCase();
  return token === command || token.startsWith(`${command}@`);
}

export function GET(): Promise<NextResponse>;
export function GET(req: Request): Promise<NextResponse>;
export async function GET(req?: Request): Promise<NextResponse> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: "TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi o'rnatilmagan.",
    });
  }
  // This endpoint performs Telegram configuration and must not be a public
  // side-effecting GET.
  if (!req || !isAuthed(req)) {
    return NextResponse.json({ success: false, error: "Faqat administrator uchun" }, { status: 401 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }

  const baseUrl = getBaseUrl();
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  const webAppUrl = `${baseUrl}/davomat`;

  try {
    // 1. Telegramga Webhookni ulash. Secret token configured bo'lsa Telegram
    // har bir webhook so'roviga shu headerni qo'shadi.
    const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        ...(process.env.TELEGRAM_WEBHOOK_SECRET
          ? { secret_token: process.env.TELEGRAM_WEBHOOK_SECRET }
          : {}),
      }),
    });
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
          { command: "login", description: "Shaxsiy hisobga ulanish (/login login parol)" },
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

async function sendTelegramReply(chatId: number | string, text: string, replyMarkup?: Record<string, unknown>) {
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
  // Production'da secret'siz webhookni ochiq qoldirish bot buyruqlarini
  // istalgan odam nomidan yuborishga imkon beradi.
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (expectedSecret ? receivedSecret !== expectedSecret : process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const webhookLimit = await rateLimit(`telegram:webhook:${clientIdentity(req).key}`, 120, 60);
  if (!webhookLimit.allowed) {
    return NextResponse.json({ error: "Juda ko'p so'rov" }, { status: 429 });
  }

  try {
    const raw = await req.text();
    if (!raw || new TextEncoder().encode(raw).byteLength > 64 * 1024) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
    const update = JSON.parse(raw) as TelegramUpdate;
    const callback = update.callback_query;
    const incomingMessage: TelegramMessage | null = update.message || (callback?.message
      ? {
          ...callback.message,
          from: callback.from || callback.message.from,
          text: callback.data === "my_groups" ? "/guruhlar" : String(callback.data || ""),
        }
      : null);
    if (!incomingMessage || !incomingMessage.text || !incomingMessage.chat?.id) {
      return NextResponse.json({ ok: true });
    }
    if (callback?.id) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (token) {
        void fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: callback.id }),
        }).catch(() => {});
      }
    }

    const message = incomingMessage;
    const baseUrl = getBaseUrl();
    const chatId = message.chat.id;
    const telegramUserId = message.from?.id;
    const text = String(message.text).trim();
    const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Foydalanuvchi";

    // Chat ID is a room/group ID, not an administrator identity. Never grant
    // admin access to everyone in TELEGRAM_CHAT_ID group.
    const adminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const isAdmin = Boolean(telegramUserId && adminIds.includes(String(telegramUserId)));
    const teacher = telegramUserId
      ? await findTeacherByTelegram(telegramUserId, message.from?.username)
      : null;
    const isTeacherActive = Boolean(teacher && (!teacher.status || teacher.status === "active"));

    // ─── 1. Bot orqali Login va Telegram hisobni ulash ───
    if (isCommand(text, "/login") || isCommand(text, "/kirish")) {
      const parts = text.split(/\s+/);
      if (parts.length < 3) {
        const usage = [
          "🔐 <b>Ustoz Kabinetiga Ulanish</b>",
          "",
          "Hisobingizni Telegramga ulash uchun login va parolingizni birga yuboring:",
          "👉 <code>/login sizning_login sizning_parol</code>",
          "",
          "Misol: <code>/login alisher 12345</code>",
          "",
          "<i>Agar hali hisob ochmagan bo'lsangiz, quyidagi tugma orqali ro'yxatdan o'ting:</i>",
        ].join("\n");
        await sendTelegramReply(chatId, usage, {
          inline_keyboard: [
            [{ text: "📝 Ro'yxatdan O'tish (Ustoz Portali)", web_app: { url: `${baseUrl}/davomat` } }],
          ],
        });
        return NextResponse.json({ ok: true });
      }

      if (!telegramUserId) {
        return NextResponse.json({ ok: true });
      }
      const loginLimit = await rateLimit(`telegram:login:${telegramUserId}`, 5, 300);
      if (!loginLimit.allowed) {
        await sendTelegramReply(chatId, "⏳ Juda ko'p urinish qilindi. Birozdan so'ng qayta urinib ko'ring.");
        return NextResponse.json({ ok: true });
      }

      const inputLogin = parts[1];
      const inputPass = parts.slice(2).join(" ");
      if (inputLogin.length > 64 || inputPass.length > 128) {
        await sendTelegramReply(chatId, "❌ Login yoki parol uzunligi ruxsat etilgan chegaradan oshdi.");
        return NextResponse.json({ ok: true });
      }

      const authedTeacher = await verifyTeacherCredentials(inputLogin, inputPass);
      if (!authedTeacher) {
        await sendTelegramReply(
          chatId,
          "❌ <b>Login yoki parol noto'g'ri!</b>\n\nIltimos, qayta tekshirib yozing yoki /start bosib 'Ustoz Portali' orqali kiring."
        );
        return NextResponse.json({ ok: true });
      }

      if (authedTeacher.status === "pending") {
        await sendTelegramReply(
          chatId,
          `⏳ <b>Arizangiz ko'rib chiqilmoqda!</b>\n\nHurmatli <b>${htmlEscape(authedTeacher.name)}</b>, sizning ro'yxatdan o'tish arizangiz hozirda ma'muriyat tasdig'ini kutmoqda. Administrator tasdiqlaganidan so'ng shaxsiy kabinetingiz ochiladi.`
        );
        return NextResponse.json({ ok: true });
      }

      if (authedTeacher.status === "blocked") {
        await sendTelegramReply(
          chatId,
          "⛔️ <b>Ushbu hisob administrator tomonidan bloklangan.</b>"
        );
        return NextResponse.json({ ok: true });
      }

      // Telegram akkauntini ustozga biriktiramiz
      const bound = await bindTeacherTelegram(authedTeacher.id, telegramUserId, message.from?.username);
      const teacherName = bound?.name || authedTeacher.name;

      const successMsg = [
        `🎉 <b>Tabriklaymiz, ${htmlEscape(teacherName)}!</b>`,
        "",
        "✅ Sizning Telegram profilingiz Algoritm Ustoz tizimiga muvaffaqiyatli ulandi!",
        `Mutaxassislik: <b>${htmlEscape(authedTeacher.subject)}</b>`,
        "",
        "Endi siz quyidagi barcha imkoniyatlardan foydalanishingiz mumkin:",
        "📱 /davomat — 5 soniyada Davomat (Mini App)",
        "👥 /guruhlar — Shaxsiy guruhlaringiz va o'quvchilaringiz",
        "📊 /hisobot — Bugungi darslar statistikasi",
      ].join("\n");

      await sendTelegramReply(chatId, successMsg, {
        inline_keyboard: [
          [{ text: "📋 Davomat Qilish (Mini App)", web_app: { url: `${baseUrl}/davomat` } }],
          [{ text: "👥 Mening Guruhlarim", callback_data: "my_groups" }],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    if (isCommand(text, "/start")) {
      if (teacher) {
        if (teacher.status === "pending") {
          const pendingMsg = [
            `👋 <b>Assalomu alaykum, ${htmlEscape(teacher.name)}!</b>`,
            "",
            "⏳ <b>Arizangiz ko'rib chiqilmoqda</b>",
            `Mutaxassislik: <b>${htmlEscape(teacher.subject)}</b>`,
            "",
            "Sizning arizangiz ma'muriyatga qabul qilingan. Administrator tasdiqlaganidan so'ng barcha guruhlar va davomat ochiladi.",
          ].join("\n");
          await sendTelegramReply(chatId, pendingMsg);
          return NextResponse.json({ ok: true });
        }

        if (teacher.status === "blocked") {
          await sendTelegramReply(chatId, "⛔️ <b>Ushbu hisob administrator tomonidan bloklangan.</b>");
          return NextResponse.json({ ok: true });
        }

        // Tizimda tasdiqlangan ustoz uchun shaxsiy xush kelibsiz xabari
        const replyText = [
          `👋 <b>Assalomu alaykum, ${htmlEscape(teacher.name)}!</b>`,
          "",
          "🏛 <b>Algoritm Ustoz Boshqaruv Markazi</b>",
          `Mutaxassislik: <b>${htmlEscape(teacher.subject)}</b>`,
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
        `👋 <b>Assalomu alaykum, ${htmlEscape(senderName)}!</b>`,
        "",
        "🏛 <b>Algoritm Academy & School</b> rasmiy xodimlar va ustozlar botiga xush kelibsiz.",
        "",
        "⚠️ <i>Ushbu bot faqat Algoritm xodimlari va o'qituvchilari uchun mo'ljallangan. Ichki guruhlar va ma'lumotlar begonalarga berilmaydi.</i>",
        "",
        "🔑 <b>Hisobingizni ulash:</b>",
        "Agar siz portaldan ro'yxatdan o'tgan bo'lsangiz, Telegram orqali darhol kirish uchun quyidagicha yuboring:",
        "👉 <code>/login sizning_login sizning_parol</code>",
        "Masalan: <code>/login alisher 12345</code>",
        "",
        "Agar hali ro'yxatdan o'tmagan bo'lsangiz, pastdagi tugma orqali yangi hisob oching:",
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

    if (isCommand(text, "/davomat")) {
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

    if (isCommand(text, "/guruhlar")) {
      if (!isTeacherActive && !isAdmin) {
        if (teacher && teacher.status === "pending") {
          await sendTelegramReply(
            chatId,
            `⏳ <b>Arizangiz ko'rib chiqilmoqda</b>\n\nHurmatli <b>${htmlEscape(teacher.name)}</b>, sizning hisobingiz administrator tomonidan tasdiqlanish jarayonida. Tasdiqlangach guruhlaringiz ochiladi.`
          );
          return NextResponse.json({ ok: true });
        }
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
      const groups = isAdmin
        ? allGroups
        : allGroups.filter(
            (g) =>
              g.teacherId === teacher?.id ||
              (!g.teacherId && g.teacherName && teacher?.name && g.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase())
          );
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
          lines.push(`<b>${idx + 1}. ${htmlEscape(g.name)}</b> (${htmlEscape(g.subject)})`);
          lines.push(`   👨‍🏫 Ustoz: ${htmlEscape(g.teacherName)}`);
          lines.push(`   ⏰ Vaqt: ${htmlEscape(g.time)} (${htmlEscape(g.days)}) | ${htmlEscape(g.room)}`);
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

    if (isCommand(text, "/hisobot")) {
      if (!isTeacherActive && !isAdmin) {
        await sendTelegramReply(
          chatId,
          "⛔️ <b>Ruxsat cheklangan</b>\n\nDavomat statistikasi faqat Algoritm xodimlari va tasdiqlangan ustozlari uchun ochiq."
        );
        return NextResponse.json({ ok: true });
      }
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const allGroups = await listGroups({ activeOnly: true });
      const groups = isAdmin
        ? allGroups
        : allGroups.filter(
            (g) =>
              g.teacherId === teacher?.id ||
              (!g.teacherId && g.teacherName && teacher?.name && g.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase())
          );

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
          lines.push(`🔹 <b>${htmlEscape(g.name)}</b> (${htmlEscape(g.teacherName)}):`);
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
