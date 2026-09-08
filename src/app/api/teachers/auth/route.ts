import { NextResponse } from "next/server";
import {
  loadTeachers,
  verifyTeacherCredentials,
  verifyPasswordHash,
  setTeacherPassword,
  registerTeacher,
  deleteTeacher,
  resetTeachers,
  createTeacherToken,
  getAuthenticatedTeacher,
  findTeacherByTelegram,
  bindTeacherTelegram,
  TEACHER_AUTH_COOKIE,
  TEACHER_SESSION_TTL,
} from "@/lib/teacherAuth";
import { listGroups, listStudents, createGroup, createStudent } from "@/lib/attendanceStore";
import { verifyTelegramWebAppData } from "@/lib/telegramAuth";
import { isAuthed, isSameOrigin } from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const currentTeacher = await getAuthenticatedTeacher(req);

    if (currentTeacher) {
      // Faqat shu ustozning guruhlari va o'quvchilari!
      const allGroups = await listGroups({ activeOnly: true });
      let teacherGroups = allGroups.filter(
        (g) => g.teacherId === currentTeacher.id || (g.teacherName && g.teacherName.toLowerCase() === currentTeacher.name.toLowerCase())
      );

      // Agar ustozga hali guruh biriktirilmagan bo'lsa, namunaviy guruh va o'quvchilarni taqdim etamiz
      if (teacherGroups.length === 0) {
        try {
          const starterGroup = await createGroup({
            name: `${currentTeacher.subject || "Matematika"} — ${currentTeacher.name}`,
            subject: currentTeacher.subject || "Matematika",
            teacherId: currentTeacher.id,
            teacherName: currentTeacher.name,
            days: "dush-chor-juma",
            time: "15:00 - 16:30",
            room: "201-xona",
            monthlyPrice: 450000,
            lessonsPerMonth: 12,
            active: true,
          });
          await createStudent({
            name: "Jahongir Rustamov",
            phone: "+998 90 123 77 88",
            parentPhone: "+998 90 987 66 55",
            groupId: starterGroup.id,
            status: "faol",
          });
          await createStudent({
            name: "Mohinur Karimova",
            phone: "+998 91 234 88 99",
            parentPhone: "+998 91 876 55 44",
            groupId: starterGroup.id,
            status: "faol",
          });
          await createStudent({
            name: "Boburmirzo Aliyev",
            phone: "+998 93 345 99 00",
            parentPhone: "+998 93 765 44 33",
            groupId: starterGroup.id,
            status: "faol",
          });
          teacherGroups = [starterGroup];
        } catch (e) {
          console.error("Failed to seed starter group:", e);
        }
      }

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

    // Tizimga kirmagan bo'lsa:
    const admin = isAuthed(req);
    if (admin) {
      const teachers = await loadTeachers();
      const adminList = teachers.map((t) => ({
        id: t.id,
        name: t.name,
        login: t.login,
        subject: t.subject,
        phone: t.phone,
        hasPassword: Boolean(t.passwordHash),
        hasTelegram: Boolean(t.telegramId),
      }));
      return NextResponse.json({
        success: true,
        authenticated: false,
        isAdmin: true,
        teachers: adminList,
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
    const body = await req.json().catch(() => ({}));
    const { action } = body;

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

      const { login, password, bindTelegramId, bindTelegramUsername } = body;
      if (!login || !password) {
        return NextResponse.json(
          { success: false, error: "Login (yoki telefon) va parolni kiriting" },
          { status: 400 }
        );
      }

      let teacher = await verifyTeacherCredentials(String(login), String(password));
      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error: "Login yoki parol noto'g'ri. Agar birinchi marta kirayotgan bo'lsangiz, 'Yangi hisob ochish' bo'limidan ro'yxatdan o'ting.",
          },
          { status: 401 }
        );
      }

      if (bindTelegramId) {
        const bound = await bindTeacherTelegram(teacher.id, bindTelegramId, bindTelegramUsername);
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

      const { teacherId, password, confirmPassword, oldPassword, phone, bindTelegramId, bindTelegramUsername } = body;
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

      const targetTeacher = (await loadTeachers()).find((t) => t.id === String(teacherId));
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
            !verifyPasswordHash(String(oldPassword), targetTeacher.salt, targetTeacher.passwordHash).valid
          ) {
            return NextResponse.json({ success: false, error: "Eski parol noto'g'ri kiritildi" }, { status: 401 });
          }
        }
      } else {
        const suppliedPhone = String(phone || "").replace(/\D/g, "");
        const storedPhone = String(targetTeacher.phone || "").replace(/\D/g, "");
        if (!admin && (!suppliedPhone || !storedPhone || suppliedPhone !== storedPhone)) {
          return NextResponse.json({ success: false, error: "Birinchi parolni o'rnatish uchun telefon raqamini tasdiqlang" }, { status: 403 });
        }
      }

      if (bindTelegramId && !admin && !isSelf) {
        return NextResponse.json({ success: false, error: "Telegramni biriktirish uchun ruxsat yo'q" }, { status: 403 });
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

      // Yangi ustoz uchun avtomatik tarzda starter guruh va o'quvchilarni yaratamiz
      try {
        const starterGroup = await createGroup({
          name: `${regResult.teacher.subject} — Asosiy Guruh`,
          subject: regResult.teacher.subject,
          teacherId: regResult.teacher.id,
          teacherName: regResult.teacher.name,
          days: "dush-chor-juma",
          time: "15:00 - 16:30",
          room: "201-xona",
          monthlyPrice: 450000,
          lessonsPerMonth: 12,
          active: true,
        });
        await createStudent({
          name: "Jahongir Rustamov",
          phone: "+998 90 123 77 88",
          parentPhone: "+998 90 987 66 55",
          groupId: starterGroup.id,
          status: "faol",
        });
        await createStudent({
          name: "Mohinur Karimova",
          phone: "+998 91 234 88 99",
          parentPhone: "+998 91 876 55 44",
          groupId: starterGroup.id,
          status: "faol",
        });
        await createStudent({
          name: "Boburmirzo Aliyev",
          phone: "+998 93 345 99 00",
          parentPhone: "+998 93 765 44 33",
          groupId: starterGroup.id,
          status: "faol",
        });
      } catch (e) {
        console.error("Auto-seed on register error:", e);
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
      const teacher = await findTeacherByTelegram(tgUser.id, tgUser.username);

      // Telegram ID/username must already be explicitly bound to a teacher.
      // Never infer account ownership from a display name.
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

    // 5. Ustozni o'chirish — faqat admin.
    if (action === "delete-teacher" || action === "delete") {
      if (!isSameOrigin(req) || !isAuthed(req)) {
        return NextResponse.json({ success: false, error: "Bu amal faqat administrator uchun" }, { status: 403 });
      }
      const { teacherId, login } = body;
      const target = teacherId || login;
      if (!target) {
        return NextResponse.json({ success: false, error: "O'chirilishi kerak bo'lgan ustoz ko'rsatilmadi" }, { status: 400 });
      }
      const ok = await deleteTeacher(String(target));
      return NextResponse.json({ success: ok, message: ok ? "Ustoz muvaffaqiyatli o'chirildi" : "Ustoz topilmadi" });
    }

    // 6. Barcha ustozlarni tozalash / qayta o'rnatish — faqat admin.
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
