import { NextResponse } from "next/server";
import {
  loadTeachers,
  verifyTeacherCredentials,
  setTeacherPassword,
  registerTeacher,
  deleteTeacher,
  resetTeachers,
  createTeacherToken,
  getAuthenticatedTeacher,
  findTeacherByTelegram,
  bindTeacherTelegram,
  sanitizeTeacher,
  TEACHER_AUTH_COOKIE,
  TEACHER_SESSION_TTL,
} from "@/lib/teacherAuth";
import { listGroups, listStudents } from "@/lib/attendanceStore";
import { verifyTelegramWebAppData } from "@/lib/telegramAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const currentTeacher = await getAuthenticatedTeacher(req);

    if (currentTeacher) {
      // Faqat shu ustozning guruhlari va o'quvchilari!
      const allGroups = await listGroups({ activeOnly: true });
      const teacherGroups = allGroups.filter((g) => g.teacherId === currentTeacher.id);
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

    // Tizimga kirmagan bo'lsa: Ustozlar ro'yxati (parol o'rnatish yoki tanlash uchun)
    const teachers = await loadTeachers();
    const publicList = teachers.map((t) => ({
      id: t.id,
      name: t.name,
      login: t.login,
      subject: t.subject,
      hasPassword: Boolean(t.passwordHash),
      hasTelegram: Boolean(t.telegramId),
    }));

    return NextResponse.json({
      success: true,
      authenticated: false,
      teachers: publicList,
    });
  } catch (error) {
    console.error("[Teacher Auth API GET Error]:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // 1. Shaxsiy Login va Parol orqali kirish
    if (action === "login") {
      const { login, password } = body;
      if (!login || !password) {
        return NextResponse.json(
          { success: false, error: "Login (yoki telefon) va parolni kiriting" },
          { status: 400 }
        );
      }

      const teacher = await verifyTeacherCredentials(String(login), String(password));
      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error: "Login yoki parol noto'g'ri. Agar birinchi marta kirayotgan bo'lsangiz, 'Yangi parol yaratish' bo'limidan o'zingizga parol o'rnating.",
          },
          { status: 401 }
        );
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

    // 2. Ustoz o'zi uchun yangi shaxsiy parol yaratishi
    if (action === "set-password") {
      const { teacherId, password, confirmPassword, bindTelegramId, bindTelegramUsername } = body;
      if (!teacherId || !password) {
        return NextResponse.json(
          { success: false, error: "Ustoz va yangi parolni kiriting" },
          { status: 400 }
        );
      }

      if (String(password).length < 4) {
        return NextResponse.json(
          { success: false, error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" },
          { status: 400 }
        );
      }

      if (confirmPassword && password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "Kiritilgan parollar bir-biriga mos kelmadi" },
          { status: 400 }
        );
      }

      const updated = await setTeacherPassword(String(teacherId), String(password));
      if (!updated) {
        return NextResponse.json({ success: false, error: "Ustoz topilmadi" }, { status: 404 });
      }

      if (bindTelegramId) {
        await bindTeacherTelegram(String(teacherId), bindTelegramId, bindTelegramUsername);
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
      const { name, subject, phone, login, password, confirmPassword, bindTelegramId, bindTelegramUsername } = body;

      if (!name || !subject || !login || !password) {
        return NextResponse.json(
          { success: false, error: "Barcha maydonlarni to'ldiring: Ism-familiya, fan, login va parol." },
          { status: 400 }
        );
      }

      if (confirmPassword && password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "Kiritilgan parollar bir-biriga mos kelmadi" },
          { status: 400 }
        );
      }

      const regResult = await registerTeacher({
        name: String(name),
        subject: String(subject),
        phone: phone ? String(phone) : undefined,
        login: String(login),
        password: String(password),
        telegramId: bindTelegramId,
        telegramUsername: bindTelegramUsername,
      });

      if (regResult.error || !regResult.teacher) {
        return NextResponse.json({ success: false, error: regResult.error || "Ro'yxatdan o'tishda xatolik" }, { status: 400 });
      }

      const token = createTeacherToken(regResult.teacher);
      const res = NextResponse.json({
        success: true,
        teacher: regResult.teacher,
        token,
        message: `Tabriklaymiz, ${regResult.teacher.name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`,
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

    // 3. Telegram WebApp orqali bir lahzada kirish
    if (action === "telegram-auth") {
      const { initData } = body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!initData || !botToken) {
        return NextResponse.json({ success: false, error: "Telegram ma'lumotlari yetarli emas" }, { status: 400 });
      }

      const authResult = verifyTelegramWebAppData(initData, botToken);
      if (!authResult.valid || !authResult.user) {
        return NextResponse.json({ success: false, error: "Telegram autentifikatsiyasi tasdiqlanmadi" }, { status: 401 });
      }

      const tgUser = authResult.user;
      let teacher = await findTeacherByTelegram(tgUser.id, tgUser.username);

      // Agar hali biriktirilmagan bo'lsa, ism bo'yicha qidirib ko'ramiz
      if (!teacher && tgUser.first_name) {
        const teachers = await loadTeachers();
        const fn = tgUser.first_name.toLowerCase();
        const match = teachers.find((t) => t.name.toLowerCase().includes(fn));
        if (match) {
          teacher = await bindTeacherTelegram(match.id, tgUser.id, tgUser.username);
        }
      }

      if (!teacher) {
        return NextResponse.json({
          success: false,
          needsBinding: true,
          telegramUser: tgUser,
          error: "Sizning Telegram profilingiz tizimdagi ustozlarga hali biriktirilmagan. Iltimos, o'z ismingizni tanlab parolingizni kiriting.",
        }, { status: 404 });
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

    // 5. Ustozni o'chirish
    if (action === "delete-teacher" || action === "delete") {
      const { teacherId, login } = body;
      const target = teacherId || login;
      if (!target) {
        return NextResponse.json({ success: false, error: "O'chirilishi kerak bo'lgan ustoz ko'rsatilmadi" }, { status: 400 });
      }
      const ok = await deleteTeacher(String(target));
      return NextResponse.json({ success: ok, message: ok ? "Ustoz muvaffaqiyatli o'chirildi" : "Ustoz topilmadi" });
    }

    // 6. Barcha ustozlarni tozalash / qayta o'rnatish
    if (action === "reset-teachers" || action === "reset") {
      const fresh = await resetTeachers();
      return NextResponse.json({ success: true, message: "Ustozlar ro'yxati boshlang'ich toza holatga keltirildi", teachers: fresh });
    }

    return NextResponse.json({ success: false, error: "Noto'g'ri amal" }, { status: 400 });
  } catch (error) {
    console.error("[Teacher Auth API POST Error]:", error);
    return NextResponse.json({ success: false, error: "Server xatosi" }, { status: 500 });
  }
}
