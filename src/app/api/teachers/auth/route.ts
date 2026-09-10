import { NextResponse } from "next/server";
import {
  loadTeachers,
  verifyTeacherCredentials,
  verifyPasswordHash,
  setTeacherPassword,
  registerTeacher,
  createTeacherByAdmin,
  updateTeacherStatus,
  adminResetTeacherPassword,
  updateTeacherDetails,
  deleteTeacher,
  resetTeachers,
  createTeacherToken,
  getAuthenticatedTeacher,
  findTeacherByTelegram,
  bindTeacherTelegram,
  TEACHER_AUTH_COOKIE,
  TEACHER_SESSION_TTL,
  type TeacherStatus,
} from "@/lib/teacherAuth";
import { listGroups, listStudents } from "@/lib/attendanceStore";
import { verifyTelegramWebAppData } from "@/lib/telegramAuth";
import { isAuthed, isSameOrigin } from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 32 * 1024;

async function readTeacherBody(req: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const raw = await req.text().catch(() => "");
  if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function verifiedTelegramBinding(body: Record<string, unknown>): { id: string; username?: string } | null {
  const rawInitData = typeof body.telegramInitData === "string" ? body.telegramInitData : "";
  if (!rawInitData) return null;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  const result = verifyTelegramWebAppData(rawInitData, token);
  if (!result.valid || !result.user) return null;
  return { id: String(result.user.id), username: result.user.username };
}

function telegramHtmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function isTeacherStatus(value: unknown): value is TeacherStatus {
  return value === "active" || value === "pending" || value === "blocked";
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isBoundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = isAuthed(req);
    const wantsAdminScope = url.searchParams.get("scope") === "admin" || url.searchParams.get("admin") === "true";

    // 1. Agar admin chaqirayotgan bo'lsa (yoki admin scope so'ralsa),
    // brauzerdagi har qanday ustoz sessiyasidan qat'i nazar barcha ustozlar ro'yxatini qaytaramiz!
    if (admin || wantsAdminScope) {
      if (!admin) {
        return NextResponse.json({ success: false, error: "Admin huquqi talab etiladi" }, { status: 401 });
      }
      const teachers = await loadTeachers();
      const allGroups = await listGroups({ activeOnly: false });

      const adminList = teachers.map((t) => {
        const assignedGroups = allGroups.filter(
          (g) => g.teacherId === t.id || (!g.teacherId && g.teacherName && g.teacherName.toLowerCase() === t.name.toLowerCase())
        );
        return {
          id: t.id,
          name: t.name,
          login: t.login,
          subject: t.subject,
          phone: t.phone || "",
          status: t.status || "active",
          createdAt: t.createdAt,
          hasPassword: Boolean(t.passwordHash),
          hasTelegram: Boolean(t.telegramId),
          telegramId: t.telegramId || null,
          telegramUsername: t.telegramUsername || null,
          groupsCount: assignedGroups.length,
          groupNames: assignedGroups.map((g) => g.name),
        };
      });

      return NextResponse.json({
        success: true,
        authenticated: false,
        isAdmin: true,
        teachers: adminList,
      });
    }

    // 2. Ustoz sessiyasi tekshiruvi
    const currentTeacher = await getAuthenticatedTeacher(req);

    if (currentTeacher) {
      // Agar ustoz pending holatida bo'lsa
      if (currentTeacher.status === "pending") {
        return NextResponse.json({
          success: true,
          authenticated: true,
          isPending: true,
          teacher: currentTeacher,
          message: "Hisobingiz administrator tomonidan ko'rib chiqilmoqda. Tasdiqlangach darslaringiz ochiladi.",
          groups: [],
          students: [],
        });
      }

      // Agar ustoz bloklangan bo'lsa
      if (currentTeacher.status === "blocked") {
        return NextResponse.json(
          {
            success: false,
            authenticated: false,
            isBlocked: true,
            error: "Hisobingiz administrator tomonidan bloklangan.",
          },
          { status: 403 }
        );
      }

      // Faqat shu ustozning o'ziga tegishli guruhlari va o'quvchilari
      const allGroups = await listGroups({ activeOnly: true });
      const teacherGroups = allGroups.filter(
        (g) => g.teacherId === currentTeacher.id || (!g.teacherId && g.teacherName && g.teacherName.toLowerCase() === currentTeacher.name.toLowerCase())
      );

      const groupIds = new Set(teacherGroups.map((g) => g.id));
      const allStudents = await listStudents({ status: "faol" });
      const teacherStudents = allStudents.filter((s) => groupIds.has(s.groupId));

      return NextResponse.json({
        success: true,
        authenticated: true,
        teacher: currentTeacher,
        groups: teacherGroups,
        students: teacherStudents,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  } catch (error) {
    console.error("[Teacher Auth API GET Error]:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await readTeacherBody(req);
    if (!body) {
      return NextResponse.json({ success: false, error: "Noto'g'ri so'rov formati" }, { status: 400 });
    }
    const { action } = body;
    if (!isSameOrigin(req)) {
      return NextResponse.json({ success: false, error: "Noto'g'ri manba" }, { status: 403 });
    }

    // 1. Shaxsiy Login va Parol orqali kirish
    if (action === "login") {
      const ip = clientIdentity(req).key;
      const limitCheck = await rateLimit("teacher:login:" + ip, 20, 60);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { success: false, error: "Juda ko'p urinish qilindi. Birozdan so'ng qayta urinib ko'ring." },
          { status: 429 }
        );
      }

      const binding = verifiedTelegramBinding(body);
      const { login, password } = body;
      if (!isBoundedString(login, 64) || !isBoundedString(password, 128) || !login.trim() || !password) {
        return NextResponse.json(
          { success: false, error: "Login (yoki telefon) va parolni kiriting" },
          { status: 400 }
        );
      }

      let teacher = await verifyTeacherCredentials(login, password);
      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error: "Login yoki parol noto'g'ri. Agar birinchi marta kirayotgan bo'lsangiz, 'Yangi hisob ochish' bo'limidan ro'yxatdan o'ting.",
          },
          { status: 401 }
        );
      }

      // Agar hisob hali tasdiqlanmagan yoki bloklangan bo'lsa
      if (teacher.status === "pending") {
        return NextResponse.json(
          {
            success: false,
            pending: true,
            error: "Hisobingiz ma'muriyat tomonidan ko'rib chiqilmoqda. Administrator tasdiqlaganidan so'ng darslaringiz ochiladi.",
          },
          { status: 403 }
        );
      }

      if (teacher.status === "blocked") {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            error: "Ushbu hisob administrator tomonidan bloklangan.",
          },
          { status: 403 }
        );
      }

      if (binding) {
        const bound = await bindTeacherTelegram(teacher.id, binding.id, binding.username);
        if (bound) teacher = bound;
      }

      const token = createTeacherToken(teacher);
      const res = NextResponse.json({
        success: true,
        teacher,
        token,
        message: `Xush kelibsiz, ${teacher.name}!`,
      });

      res.cookies.set(TEACHER_AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TEACHER_SESSION_TTL,
      });

      return res;
    }

    // 2. Ustoz o'zi uchun yangi shaxsiy parol yaratishi yoki parolni o'zgartirish
    if (action === "set-password") {
      if (!isSameOrigin(req)) {
        return NextResponse.json({ success: false, error: "Noto'g'ri manba" }, { status: 403 });
      }

      const ip = clientIdentity(req).key;
      const limitCheck = await rateLimit("teacher:setpw:" + ip, 10, 300);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { success: false, error: "Juda ko'p urinish qilindi. Birozdan so'ng qayta urinib ko'ring." },
          { status: 429 }
        );
      }

      const binding = verifiedTelegramBinding(body);
      const { teacherId, password, confirmPassword, oldPassword, phone } = body;
      if (
        !isBoundedString(teacherId, 64) ||
        !isBoundedString(password, 128) ||
        (oldPassword !== undefined && !isBoundedString(oldPassword, 128)) ||
        (phone !== undefined && !isBoundedString(phone, 32)) ||
        !teacherId.trim() ||
        !password
      ) {
        return NextResponse.json(
          { success: false, error: "Ustoz va yangi parolni kiriting" },
          { status: 400 }
        );
      }

      if (password.length < 4) {
        return NextResponse.json(
          { success: false, error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" },
          { status: 400 }
        );
      }

      if (confirmPassword !== undefined && (!isBoundedString(confirmPassword, 128) || password !== confirmPassword)) {
        return NextResponse.json(
          { success: false, error: "Kiritilgan parollar bir-biriga mos kelmadi" },
          { status: 400 }
        );
      }

      const targetTeacher = (await loadTeachers()).find((t) => t.id === teacherId);
      if (!targetTeacher) {
        return NextResponse.json({ success: false, error: "Ustoz topilmadi" }, { status: 404 });
      }

      const currentTeacher = await getAuthenticatedTeacher(req);
      const admin = isAuthed(req);
      const isSelf = currentTeacher?.id === targetTeacher.id;

      if (targetTeacher.passwordHash) {
        if (!admin) {
          if (!isSelf) {
            return NextResponse.json({ success: false, error: "Bu amal uchun ruxsat yo'q" }, { status: 403 });
          }
          if (
            !oldPassword ||
            !targetTeacher.salt ||
            !verifyPasswordHash(oldPassword, targetTeacher.salt, targetTeacher.passwordHash).valid
          ) {
            return NextResponse.json({ success: false, error: "Eski parol noto'g'ri kiritildi" }, { status: 401 });
          }
        }
      } else {
        const suppliedPhone = (phone || "").replace(/\D/g, "");
        const storedPhone = String(targetTeacher.phone || "").replace(/\D/g, "");
        if (!admin && (!suppliedPhone || !storedPhone || suppliedPhone !== storedPhone)) {
          return NextResponse.json({ success: false, error: "Birinchi parolni o'rnatish uchun telefon raqamini tasdiqlang" }, { status: 403 });
        }
      }

      if (binding && !admin && !isSelf) {
        return NextResponse.json({ success: false, error: "Telegramni biriktirish uchun ruxsat yo'q" }, { status: 403 });
      }

      const updated = await setTeacherPassword(teacherId, password);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Ustoz topilmadi" }, { status: 404 });
      }

      if (binding) {
        await bindTeacherTelegram(teacherId, binding.id, binding.username);
      }

      const token = createTeacherToken(updated);
      const res = NextResponse.json({
        success: true,
        teacher: updated,
        token,
        message: "Shaxsiy parolingiz muvaffaqiyatli o'rnatildi!",
      });

      res.cookies.set(TEACHER_AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TEACHER_SESSION_TTL,
      });

      return res;
    }

    // 2.1. Yangi ustozning mustaqil ro'yxatdan o'tishi (Ism-familiya, fan, telefon, login, parol)
    if (action === "register") {
      if (!isSameOrigin(req)) {
        return NextResponse.json({ success: false, error: "Noto'g'ri manba" }, { status: 403 });
      }

      const ip = clientIdentity(req).key;
      const limitCheck = await rateLimit("teacher:register:" + ip, 10, 300);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { success: false, error: "Juda ko'p ro'yxatdan o'tish so'rovi yuborildi. Birozdan so'ng qayta urinib ko'ring." },
          { status: 429 }
        );
      }

      const binding = verifiedTelegramBinding(body);
      const { name, subject, phone, login, password, confirmPassword } = body;

      if (!isBoundedString(name, 160) || !isBoundedString(subject, 160) || !isBoundedString(login, 64) || !isBoundedString(password, 128) || !isBoundedString(confirmPassword, 128) || !name.trim() || !subject.trim() || !login.trim() || !password) {
        return NextResponse.json(
          { success: false, error: "Barcha maydonlarni to'ldiring: Ism-familiya, fan, login, parol va parol tasdig'i." },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "Kiritilgan parollar bir-biriga mos kelmadi" },
          { status: 400 }
        );
      }
      if (phone !== undefined && !isBoundedString(phone, 32)) {
        return NextResponse.json({ success: false, error: "Telefon raqami noto'g'ri" }, { status: 400 });
      }

      const regResult = await registerTeacher({
        name,
        subject,
        phone: phone || undefined,
        login,
        password,
        telegramId: binding?.id,
        telegramUsername: binding?.username,
      });

      if (regResult.error || !regResult.teacher) {
        return NextResponse.json({ success: false, error: regResult.error || "Ro'yxatdan o'tishda xatolik" }, { status: 400 });
      }

      // Telegram orqali Adminga yangi ustoz ro'yxatdan o'tgani haqida bildirishnoma yuboramiz
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        const alertMsg = [
          "🔔 <b>Yangi ustoz ro'yxatdan o'tdi!</b>",
          "━━━━━━━━━━━━━━━━━━━━",
          `👤 F.I.Sh: <b>${telegramHtmlEscape(regResult.teacher.name)}</b>`,
          `📚 Fan / Mutaxassislik: <b>${telegramHtmlEscape(regResult.teacher.subject)}</b>`,
          `📱 Telefon: <b>${telegramHtmlEscape(regResult.teacher.phone || "Kiritilmagan")}</b>`,
          `🔑 Login: <code>${telegramHtmlEscape(regResult.teacher.login)}</code>`,
          `⏳ Holati: <b>Tasdiqlash kutilmoqda (pending)</b>`,
          "",
          "👉 <i>Admin panel (/admin) — 'Ustozlar' bo'limi orqali ushbu hisobni tasdiqlashingiz yoki rad etishingiz mumkin.</i>",
        ].join("\n");

        void fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: alertMsg,
            parse_mode: "HTML",
          }),
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        isPending: true,
        teacher: regResult.teacher,
        message: "Ro'yxatdan o'tish arizangiz qabul qilindi! Administrator tasdiqlaganidan so'ng shaxsiy kabinetingiz ochiladi.",
      });
    }

    // 3. Telegram WebApp orqali bir lahzada kirish
    if (action === "telegram-auth") {
      const { initData } = body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (typeof initData !== "string" || !initData || !botToken) {
        return NextResponse.json({ success: false, error: "Telegram ma'lumotlari yetarli emas" }, { status: 400 });
      }

      const authResult = verifyTelegramWebAppData(initData, botToken);
      if (!authResult.valid || !authResult.user) {
        return NextResponse.json({ success: false, error: "Telegram autentifikatsiyasi tasdiqlanmadi" }, { status: 401 });
      }

      const tgUser = authResult.user;
      const teacher = await findTeacherByTelegram(tgUser.id, tgUser.username);

      if (!teacher) {
        return NextResponse.json({
          success: false,
          needsBinding: true,
          telegramUser: tgUser,
          error: "Sizning Telegram profilingiz tizimdagi ustozlarga hali biriktirilmagan. Iltimos, login va parolingiz orqali kiring.",
        }, { status: 404 });
      }

      if (teacher.status === "pending") {
        return NextResponse.json({
          success: false,
          pending: true,
          error: `Hurmatli ${teacher.name}, hisobingiz administrator tasdig'ini kutmoqda.`,
        }, { status: 403 });
      }

      if (teacher.status === "blocked") {
        return NextResponse.json({
          success: false,
          blocked: true,
          error: "Ushbu profil administrator tomonidan bloklangan.",
        }, { status: 403 });
      }

      const token = createTeacherToken(teacher);
      const res = NextResponse.json({
        success: true,
        teacher,
        token,
        message: `Assalomu alaykum, ${teacher.name}!`,
      });

      res.cookies.set(TEACHER_AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TEACHER_SESSION_TTL,
      });

      return res;
    }

    // 4. Chiqish (Logout)
    if (action === "logout") {
      const res = NextResponse.json({ success: true, message: "Muvaffaqiyatli chiqildi" });
      res.cookies.set(TEACHER_AUTH_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // 5. Admin harakatlari (Faqat Administrator uchun)
    if (action === "admin-create-teacher") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Faqat administrator uchun" }, { status: 403 });
      }
      const { name, subject, phone, login, password, status } = body;
      if (
        !isBoundedString(name, 160) ||
        !isBoundedString(subject, 160) ||
        !isBoundedString(login, 64) ||
        !isBoundedString(password, 128) ||
        !name.trim() ||
        !subject.trim() ||
        !login.trim() ||
        !password ||
        (phone !== undefined && !isBoundedString(phone, 32)) ||
        (status !== undefined && !isTeacherStatus(status))
      ) {
        return NextResponse.json({ success: false, error: "Ustoz ma'lumotlari noto'g'ri yoki to'liq emas" }, { status: 400 });
      }
      const resCreate = await createTeacherByAdmin({
        name,
        subject,
        phone: phone || undefined,
        login,
        password,
        status: status || "active",
      });
      if (resCreate.error || !resCreate.teacher) {
        return NextResponse.json({ success: false, error: resCreate.error || "Ustozni yaratishda xato" }, { status: 400 });
      }
      return NextResponse.json({ success: true, teacher: resCreate.teacher, message: "Yangi ustoz muvaffaqiyatli qo'shildi!" });
    }

    if (action === "admin-update-status") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Faqat administrator uchun" }, { status: 403 });
      }
      const { teacherId, status } = body;
      if (!isBoundedString(teacherId, 64) || !teacherId.trim() || !isTeacherStatus(status)) {
        return NextResponse.json({ success: false, error: "Ustoz va yangi statusni to'g'ri ko'rsating" }, { status: 400 });
      }
      const updated = await updateTeacherStatus(teacherId, status);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Ustoz topilmadi" }, { status: 404 });
      }
      return NextResponse.json({ success: true, teacher: updated, message: `Ustoz holati yangilandi: ${status}` });
    }

    if (action === "admin-reset-password") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Faqat administrator uchun" }, { status: 403 });
      }
      const { teacherId, newPassword } = body;
      if (!isBoundedString(teacherId, 64) || !teacherId.trim() || !isBoundedString(newPassword, 128) || newPassword.length < 4) {
        return NextResponse.json({ success: false, error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
      }
      const updated = await adminResetTeacherPassword(teacherId, newPassword);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Ustoz topilmadi" }, { status: 404 });
      }
      return NextResponse.json({ success: true, teacher: updated, message: "Ustoz paroli muvaffaqiyatli yangilandi!" });
    }

    if (action === "admin-update-teacher") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Faqat administrator uchun" }, { status: 403 });
      }
      const { teacherId, name, subject, phone, login } = body;
      if (!isBoundedString(teacherId, 64) || !teacherId.trim()) {
        return NextResponse.json({ success: false, error: "Ustoz tanlanmadi" }, { status: 400 });
      }
      if (
        (name !== undefined && !isBoundedString(name, 160)) ||
        (subject !== undefined && !isBoundedString(subject, 160)) ||
        (phone !== undefined && !isBoundedString(phone, 32)) ||
        (login !== undefined && !isBoundedString(login, 64))
      ) {
        return NextResponse.json({ success: false, error: "Ustoz ma'lumotlari noto'g'ri" }, { status: 400 });
      }
      const resUpdate = await updateTeacherDetails(teacherId, {
        name: optionalString(name),
        subject: optionalString(subject),
        phone: optionalString(phone),
        login: optionalString(login),
      });
      if (resUpdate.error || !resUpdate.teacher) {
        return NextResponse.json({ success: false, error: resUpdate.error || "Tahrirlashda xato" }, { status: 400 });
      }
      return NextResponse.json({ success: true, teacher: resUpdate.teacher, message: "Ustoz ma'lumotlari yangilandi" });
    }

    // 6. Ustozni o'chirish — faqat admin.
    if (action === "delete-teacher" || action === "delete") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Bu amal faqat administrator uchun" }, { status: 403 });
      }
      const { teacherId, login } = body;
      const target = teacherId ?? login;
      if (!isBoundedString(target, 64) || !target.trim()) {
        return NextResponse.json({ success: false, error: "O'chirilishi kerak bo'lgan ustoz ko'rsatilmadi" }, { status: 400 });
      }
      const ok = await deleteTeacher(target);
      return NextResponse.json({ success: ok, message: ok ? "Ustoz muvaffaqiyatli o'chirildi" : "Ustoz topilmadi" });
    }

    // 7. Barcha ustozlarni tozalash / qayta o'rnatish — faqat admin.
    if (action === "reset-teachers" || action === "reset") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Bu amal faqat administrator uchun" }, { status: 403 });
      }
      const fresh = await resetTeachers();
      return NextResponse.json({ success: true, message: "Ustozlar ro'yxati boshlang'ich toza holatga keltirildi", teachers: fresh });
    }

    return NextResponse.json({ success: false, error: "Noto'g'ri amal" }, { status: 400 });
  } catch (error) {
    console.error("[Teacher Auth API POST Error]:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}
