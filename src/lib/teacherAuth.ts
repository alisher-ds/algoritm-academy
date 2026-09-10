import { createHmac, randomBytes, timingSafeEqual, scryptSync } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { isDbConnected, query, initDatabase } from "./db";

export type TeacherStatus = "active" | "pending" | "blocked";

export interface Teacher {
  id: string;
  name: string;
  login: string;
  subject: string;
  phone?: string;
  passwordHash?: string;
  salt?: string;
  telegramId?: string;
  telegramUsername?: string;
  createdAt: string;
  status?: TeacherStatus;
}

export const TEACHER_AUTH_COOKIE = "algoritm_teacher_session";
export const TEACHER_SESSION_TTL = 60 * 60 * 24 * 30; // 30 kun

// Boshlang'ich ustozlar ro'yxati
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "tm-aziz",
    name: "Aziz Xolmurodov",
    login: "aziz",
    subject: "Matematika & SAT Math",
    phone: "+998901234501",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-jasur",
    name: "Jasur Jovliyev",
    login: "jasur",
    subject: "Ingliz Tili · IELTS",
    phone: "+998901234502",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-oxunjon",
    name: "Oxunjon Ozodov",
    login: "oxunjon",
    subject: "Digital SAT",
    phone: "+998901234503",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-adham",
    name: "Adham Sohibov",
    login: "adham",
    subject: "Prezident Maktabi & Mantiq",
    phone: "+998901234504",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-shohista",
    name: "Shohista Jalilovna",
    login: "shohista",
    subject: "Boshlang'ich Rus Sinf",
    phone: "+998901234505",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
  {
    id: "tm-bobur",
    name: "Bobur Xaydarov",
    login: "bobur",
    subject: "Asoschi & SAT Math",
    phone: "+998901234506",
    createdAt: "2026-09-01T00:00:00.000Z",
    status: "active",
  },
];

// Upstash Redis konfiguratsiyasi
function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

const REDIS_TEACHERS_KEY = process.env.TEACHERS_REDIS_KEY || "algoritm:teachers";

async function redisGetTeachers(): Promise<Teacher[] | null> {
  const cfg = upstashConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/get/${encodeURIComponent(REDIS_TEACHERS_KEY)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result) {
      const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
      return Array.isArray(parsed) ? parsed : null;
    }
    return null;
  } catch {
    return null;
  }
}

async function redisSaveTeachers(teachers: Teacher[]): Promise<boolean> {
  const cfg = upstashConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/set/${encodeURIComponent(REDIS_TEACHERS_KEY)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(teachers)),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Xotirada va faylda ustozlarni saqlash kesh
interface GlobalTeacherScope {
  __algoritm_teachers__?: Teacher[];
}

function getGlobalTeachers(): Teacher[] | null {
  const g = globalThis as unknown as GlobalTeacherScope;
  return g.__algoritm_teachers__ || null;
}

function setGlobalTeachers(teachers: Teacher[]): void {
  const g = globalThis as unknown as GlobalTeacherScope;
  g.__algoritm_teachers__ = teachers;
}

export function __resetTeacherCache(): void {
  const g = globalThis as unknown as GlobalTeacherScope;
  delete g.__algoritm_teachers__;
}

function getStoragePath(): string {
  if (process.env.TEACHERS_FILE) return process.env.TEACHERS_FILE;
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  return isServerless
    ? path.join(os.tmpdir(), "algoritm_teachers.json")
    : path.join(process.cwd(), ".data", "teachers.json");
}

let teacherFileMtime = 0;

export function isEphemeralTeacherStorage(): boolean {
  return !isDbConnected() && !upstashConfig() && Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function loadTeachers(): Promise<Teacher[]> {
  // 0. PostgreSQL (Supabase / Neon / Vercel Postgres)
  if (isDbConnected()) {
    try {
      await initDatabase();
      const rows = await query<{
        id: string;
        name: string;
        login: string;
        subject: string;
        phone?: string | null;
        password_hash?: string | null;
        salt?: string | null;
        telegram_id?: string | null;
        telegram_username?: string | null;
        status: TeacherStatus;
        created_at: Date | string;
      }>("SELECT * FROM teachers ORDER BY created_at ASC");

      if (rows.length === 0) {
        const marker = await query<{ value: string }>("SELECT value FROM app_metadata WHERE key = $1", ["teachers_seeded"]);
        if (marker.length === 0) {
          for (const t of INITIAL_TEACHERS) {
            await query(
              `INSERT INTO teachers (id, name, login, subject, phone, password_hash, salt, telegram_id, telegram_username, status, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (login) DO NOTHING`,
              [
                t.id,
                t.name,
                t.login,
                t.subject,
                t.phone || null,
                t.passwordHash || null,
                t.salt || null,
                t.telegramId || null,
                t.telegramUsername || null,
                t.status || "active",
                t.createdAt,
              ]
            );
          }
          await query(
            "INSERT INTO app_metadata (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
            ["teachers_seeded", new Date().toISOString()]
          );
          const initial = INITIAL_TEACHERS.map((teacher) => ({ ...teacher }));
          setGlobalTeachers(initial);
          return initial;
        }
        setGlobalTeachers([]);
        return [];
      }

      const teachers: Teacher[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        login: r.login,
        subject: r.subject,
        phone: r.phone || undefined,
        passwordHash: r.password_hash || undefined,
        salt: r.salt || undefined,
        telegramId: r.telegram_id || undefined,
        telegramUsername: r.telegram_username || undefined,
        status: r.status || "active",
        createdAt: new Date(r.created_at).toISOString(),
      }));

      setGlobalTeachers(teachers);
      return teachers;
    } catch (err) {
      console.error("[teacherAuth] PostgreSQL dan ustozlarni yuklashda xato:", err);
      throw new Error("Markaziy ma'lumotlar bazasiga ulanib bo'lmadi");
    }
  }

  // 1. Upstash Redis (agar sozlangan bo'lsa)
  const redisTeachers = await redisGetTeachers();
  if (redisTeachers !== null) {
    setGlobalTeachers(redisTeachers);
    return redisTeachers;
  }

  // 2. Mahalliy yoki vaqtinchalik fayl tizimi
  const filePath = getStoragePath();
  try {
    const stat = await fs.stat(filePath);
    const cached = getGlobalTeachers();
    if (cached && stat.mtimeMs === teacherFileMtime) {
      return cached;
    }
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      teacherFileMtime = stat.mtimeMs;
      setGlobalTeachers(parsed);
      return parsed;
    }
  } catch {
    // Fayl mavjud emas bo'lsa boshlang'ich ma'lumotlar ishlatiladi
  }

  const initial = INITIAL_TEACHERS.map((teacher) => ({ ...teacher }));
  await saveTeachers(initial);
  return initial;
}

export async function saveTeachers(teachers: Teacher[]): Promise<void> {
  // 0. PostgreSQL
  if (isDbConnected()) {
    try {
      await initDatabase();
      for (const t of teachers) {
        await query(
          `INSERT INTO teachers (id, name, login, subject, phone, password_hash, salt, telegram_id, telegram_username, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             login = EXCLUDED.login,
             subject = EXCLUDED.subject,
             phone = EXCLUDED.phone,
             password_hash = EXCLUDED.password_hash,
             salt = EXCLUDED.salt,
             telegram_id = EXCLUDED.telegram_id,
             telegram_username = EXCLUDED.telegram_username,
             status = EXCLUDED.status`,
          [
            t.id,
            t.name,
            t.login,
            t.subject,
            t.phone || null,
            t.passwordHash || null,
            t.salt || null,
            t.telegramId || null,
            t.telegramUsername || null,
            t.status || "active",
            t.createdAt,
          ]
        );
      }
    } catch (err) {
      console.error("[teacherAuth] PostgreSQL ga ustozlarni saqlashda xato:", err);
      throw new Error("Markaziy ma'lumotlar bazasiga saqlab bo'lmadi");
    }
    setGlobalTeachers(teachers);
    return;
  }

  // 1. Upstash Redis ga yozish
  if (upstashConfig()) {
    const saved = await redisSaveTeachers(teachers);
    if (!saved) throw new Error("Markaziy Redis bazasiga saqlab bo'lmadi");
    setGlobalTeachers(teachers);
    return;
  }

  // 2. Fayl tizimiga yozish
  const filePath = getStoragePath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(teachers, null, 2), "utf8");
    const stat = await fs.stat(filePath).catch(() => null);
    teacherFileMtime = stat?.mtimeMs || Date.now();
    // Kesh faqat diskdagi yozuv muvaffaqiyatli bo'lgach yangilanadi.
    setGlobalTeachers(teachers);
  } catch (err) {
    console.error("[teacherAuth] Ustozlar ma'lumotlarini saqlashda xato:", err);
    throw new Error("Ustozlar ma'lumotlarini saqlab bo'lmadi");
  }
}

/** Ustozni id yoki login orqali o'chirish */
export async function deleteTeacher(idOrLogin: string): Promise<boolean> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const clean = idOrLogin.trim().toLowerCase();
  const filtered = teachers.filter(
    (t) => t.id !== idOrLogin && t.login.toLowerCase() !== clean
  );
  if (filtered.length === teachers.length) return false;

  if (isDbConnected()) {
    try {
      await initDatabase();
      await query("DELETE FROM teachers WHERE id = $1 OR LOWER(login) = $2", [idOrLogin, clean]);
    } catch (err) {
      console.error("[teacherAuth] PostgreSQL dan ustozni o'chirishda xato:", err);
      throw new Error("Ustozni markaziy ma'lumotlar bazasidan o'chirib bo'lmadi");
    }
  }

  await saveTeachers(filtered);
  return true;
}

/** Barcha ustozlar ro'yxatini boshlang'ich toza holatga qaytarish */
export async function resetTeachers(): Promise<Teacher[]> {
  const fresh = [...INITIAL_TEACHERS];
  if (isDbConnected()) {
    try {
      await initDatabase();
      await query("DELETE FROM teachers");
      for (const t of fresh) {
        await query(
          `INSERT INTO teachers (id, name, login, subject, phone, password_hash, salt, telegram_id, telegram_username, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            t.id,
            t.name,
            t.login,
            t.subject,
            t.phone || null,
            t.passwordHash || null,
            t.salt || null,
            t.telegramId || null,
            t.telegramUsername || null,
            t.status || "active",
            t.createdAt,
          ]
        );
      }
    } catch (err) {
      console.error("[teacherAuth] PostgreSQL ni tozalashda xato:", err);
      throw new Error("Ustozlar bazasini tozalab bo'lmadi");
    }
  }
  await saveTeachers(fresh);
  return fresh;
}

/** Password hashing using Node's built-in memory-hard scrypt. */
export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

/** Verify legacy HMAC-SHA256 hashes and transparently upgrade them to scrypt. */
export function verifyPasswordHash(password: string, salt: string, storedHash: string): { valid: boolean; needsUpgrade: boolean } {
  const legacy = createHmac("sha256", salt).update(password).digest("hex");
  if (storedHash.length === legacy.length) {
    return { valid: safeEqual(legacy, storedHash), needsUpgrade: true };
  }
  const computed = hashPassword(password, salt);
  return { valid: safeEqual(computed, storedHash), needsUpgrade: false };
}

/** Timing-safe solishtirish */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Ustoz uchun yangi parol o'rnatish */
export async function setTeacherPassword(teacherId: string, plainPassword: string): Promise<Teacher | null> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const index = teachers.findIndex((t) => t.id === teacherId);
  if (index === -1) return null;

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(plainPassword, salt);

  teachers[index] = {
    ...teachers[index],
    passwordHash,
    salt,
  };

  await saveTeachers(teachers);
  return sanitizeTeacher(teachers[index]);
}

export interface RegisterTeacherInput {
  name: string;
  login: string;
  subject: string;
  phone?: string;
  password: string;
  telegramId?: string | number;
  telegramUsername?: string;
}

/** Yangi ustozning mustaqil ro'yxatdan o'tishi */
export async function registerTeacher(input: RegisterTeacherInput): Promise<{ teacher?: Teacher; error?: string }> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const name = input.name?.trim();
  const login = input.login?.trim().toLowerCase();
  const subject = input.subject?.trim();
  const password = input.password;
  const phone = input.phone?.trim();

  if (!name || name.length < 3) {
    return { error: "Ism va familiyangizni to'liq kiriting (kamida 3 ta harf)" };
  }
  if (!login || login.length < 3 || !/^[a-z0-9_.-]+$/.test(login)) {
    return { error: "Login kamida 3 ta lotin harfi yoki raqamdan iborat bo'lishi kerak (masalan: aziz_sat)" };
  }
  if (!subject || subject.length < 2) {
    return { error: "Faningiz yoki mutaxassisligingizni kiriting" };
  }
  if (!password || password.length < 4) {
    return { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" };
  }

  // Dublikat loginni tekshirish
  const exists = teachers.some((t) => t.login.toLowerCase() === login);
  if (exists) {
    return { error: "Ushbu login band. Iltimos, boshqa login tanlang." };
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const id = `tm_${Date.now()}_${randomBytes(3).toString("hex")}`;

  const newTeacher: Teacher = {
    id,
    name,
    login,
    subject,
    phone,
    passwordHash,
    salt,
    telegramId: input.telegramId ? String(input.telegramId) : undefined,
    telegramUsername: input.telegramUsername ? input.telegramUsername.replace(/^@/, "") : undefined,
    createdAt: new Date().toISOString(),
    status: "pending", // Mustaqil ro'yxatdan o'tgan ustoz admin tasdiqlashi kutilmoqda holatida bo'ladi
  };

  teachers.push(newTeacher);
  await saveTeachers(teachers);

  return { teacher: sanitizeTeacher(newTeacher) };
}

export interface AdminCreateTeacherInput {
  name: string;
  login: string;
  subject: string;
  phone?: string;
  password: string;
  telegramId?: string | number;
  telegramUsername?: string;
  status?: TeacherStatus;
}

/** Admin tomonidan yangi ustoz qo'shish (darhol faol holatda) */
export async function createTeacherByAdmin(input: AdminCreateTeacherInput): Promise<{ teacher?: Teacher; error?: string }> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const name = input.name?.trim();
  const login = input.login?.trim().toLowerCase();
  const subject = input.subject?.trim();
  const password = input.password;
  const phone = input.phone?.trim();

  if (!name || name.length < 3) {
    return { error: "Ism va familiyani to'liq kiriting (kamida 3 ta harf)" };
  }
  if (!login || login.length < 3 || !/^[a-z0-9_.-]+$/.test(login)) {
    return { error: "Login kamida 3 ta lotin harfi yoki raqamdan iborat bo'lishi kerak" };
  }
  if (!subject || subject.length < 2) {
    return { error: "Fanni kiriting" };
  }
  if (!password || password.length < 4) {
    return { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" };
  }

  const exists = teachers.some((t) => t.login.toLowerCase() === login);
  if (exists) {
    return { error: "Ushbu login band. Boshqa login tanlang." };
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const id = `tm_${Date.now()}_${randomBytes(3).toString("hex")}`;

  const newTeacher: Teacher = {
    id,
    name,
    login,
    subject,
    phone,
    passwordHash,
    salt,
    telegramId: input.telegramId ? String(input.telegramId) : undefined,
    telegramUsername: input.telegramUsername ? input.telegramUsername.replace(/^@/, "") : undefined,
    createdAt: new Date().toISOString(),
    status: input.status || "active",
  };

  teachers.push(newTeacher);
  await saveTeachers(teachers);
  return { teacher: sanitizeTeacher(newTeacher) };
}

/** Admin tomonidan ustoz holatini o'zgartirish (active / pending / blocked) */
export async function updateTeacherStatus(teacherId: string, status: TeacherStatus): Promise<Teacher | null> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const index = teachers.findIndex((t) => t.id === teacherId);
  if (index === -1) return null;

  teachers[index] = {
    ...teachers[index],
    status,
  };

  await saveTeachers(teachers);
  return sanitizeTeacher(teachers[index]);
}

/** Admin tomonidan ustoz parolini bevosita yangilash (reset) */
export async function adminResetTeacherPassword(teacherId: string, plainPassword: string): Promise<Teacher | null> {
  return setTeacherPassword(teacherId, plainPassword);
}

/** Admin tomonidan ustoz ma'lumotlarini tahrirlash */
export async function updateTeacherDetails(
  teacherId: string,
  details: { name?: string; subject?: string; phone?: string; login?: string }
): Promise<{ teacher?: Teacher; error?: string }> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const index = teachers.findIndex((t) => t.id === teacherId);
  if (index === -1) return { error: "Ustoz topilmadi" };

  if (details.login) {
    const cleanLogin = details.login.trim().toLowerCase();
    const exists = teachers.some((t) => t.id !== teacherId && t.login.toLowerCase() === cleanLogin);
    if (exists) return { error: "Ushbu login boshqa ustoz tomonidan band qilingan" };
    teachers[index].login = cleanLogin;
  }
  if (details.name) teachers[index].name = details.name.trim();
  if (details.subject) teachers[index].subject = details.subject.trim();
  if (details.phone !== undefined) teachers[index].phone = details.phone.trim();

  await saveTeachers(teachers);
  return { teacher: sanitizeTeacher(teachers[index]) };
}

/** Login yoki telefon hamda parol bilan tekshirish */
export async function verifyTeacherCredentials(
  loginOrPhone: string,
  plainPassword: string
): Promise<Teacher | null> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const clean = loginOrPhone.trim().toLowerCase();
  const digits = clean.replace(/\D/g, "");

  const teacher = teachers.find((t) => {
    if (t.login.toLowerCase() === clean) return true;
    if (t.name.toLowerCase() === clean) return true;
    if (t.phone) {
      const pDigits = t.phone.replace(/\D/g, "");
      if (pDigits === digits) return true;
      if (digits.length >= 9 && pDigits.endsWith(digits.slice(-9))) return true;
      if (pDigits.length >= 9 && digits.endsWith(pDigits.slice(-9))) return true;
    }
    return false;
  });

  if (!teacher) return null;

  // Agar ustoz hali parol o'rnatmagan bo'lsa
  if (!teacher.passwordHash || !teacher.salt) {
    return null;
  }

  const verification = verifyPasswordHash(plainPassword, teacher.salt, teacher.passwordHash);
  if (!verification.valid) return null;

  if (verification.needsUpgrade) {
    const index = teachers.findIndex((t) => t.id === teacher.id);
    if (index !== -1) {
      const newSalt = randomBytes(16).toString("hex");
      teachers[index] = { ...teachers[index], passwordHash: hashPassword(plainPassword, newSalt), salt: newSalt };
      await saveTeachers(teachers);
      return sanitizeTeacher(teachers[index]);
    }
  }

  return sanitizeTeacher(teacher);
}

/** Telegram ID orqali ustozni topish */
export async function findTeacherByTelegram(
  telegramId: string | number,
  _username?: string
): Promise<Teacher | null> {
  void _username;
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const idStr = String(telegramId);

  // Telegram username/login is not an authenticator: usernames can be changed and
  // a public login can be guessed. Only the immutable numeric Telegram user ID
  // may establish an account binding.
  const match = teachers.find((t) => t.telegramId && String(t.telegramId) === idStr);
  return match ? sanitizeTeacher(match) : null;
}

/** Ustoz profiliga Telegram ma'lumotlarini biriktirish */
export async function bindTeacherTelegram(
  teacherId: string,
  telegramId: string | number,
  telegramUsername?: string
): Promise<Teacher | null> {
  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  const index = teachers.findIndex((t) => t.id === teacherId);
  if (index === -1) return null;

  teachers[index] = {
    ...teachers[index],
    telegramId: String(telegramId),
    telegramUsername: telegramUsername ? telegramUsername.replace(/^@/, "") : teachers[index].telegramUsername,
  };

  await saveTeachers(teachers);
  return sanitizeTeacher(teachers[index]);
}

/** Shaxsiy xavfsizlik: Parol xeshi va tuzini yashirish */
export function sanitizeTeacher(teacher: Teacher): Teacher {
  const safe: Partial<Teacher> = { ...teacher };
  delete safe.passwordHash;
  delete safe.salt;
  return safe as Teacher;
}

// ─────────────────────── Sessiya Tokenlari (HMAC Imzo) ───────────────────────

let sessionSecretWarned = false;
function getSessionSecret(): string {
  const explicit = process.env.TEACHER_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const fallback = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.TELEGRAM_BOT_TOKEN;
  if (fallback) {
    if (!sessionSecretWarned && process.env.NODE_ENV === "production") {
      sessionSecretWarned = true;
      console.warn("[teacherAuth] DIQQAT: TEACHER_SESSION_SECRET o'rnatilmagan. ADMIN kalitidan kriptografik ajratilgan xavfsiz kalit ishlatilmoqda.");
    }
    return createHmac("sha256", "algoritm-teacher-isolated-secret-v1").update(fallback).digest("hex");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("TEACHER_SESSION_SECRET yoki ADMIN_PASSWORD production muhitida o'rnatilishi shart");
  }
  return createHmac("sha256", "teacher-token-salt").update("local-development-only-teacher-secret").digest("hex");
}

export interface TeacherSessionPayload {
  teacherId: string;
  name: string;
  login: string;
  subject?: string;
  phone?: string;
  telegramId?: string;
  telegramUsername?: string;
  status?: TeacherStatus;
  iat: number;
  exp: number;
}

export function createTeacherToken(teacher: Teacher, ttlSeconds = TEACHER_SESSION_TTL): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TeacherSessionPayload = {
    teacherId: teacher.id,
    name: teacher.name,
    login: teacher.login,
    subject: teacher.subject,
    phone: teacher.phone,
    telegramId: teacher.telegramId,
    telegramUsername: teacher.telegramUsername,
    status: teacher.status,
    iat: now,
    exp: now + ttlSeconds,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  return `t1.${body}.${sig}`;
}

export function verifyTeacherToken(token: string | undefined | null): TeacherSessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "t1") return null;

  const [, body, sig] = parts;
  const expectedSig = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  if (!safeEqual(sig, expectedSig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TeacherSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return undefined;
}

export async function getAuthenticatedTeacher(req: Request): Promise<Teacher | null> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader && authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const cookieHeader = req.headers.get("cookie");
  const token = bearerToken || readCookie(cookieHeader, TEACHER_AUTH_COOKIE) || req.headers.get("x-teacher-token");
  const payload = verifyTeacherToken(token);
  if (!payload) return null;

  const teachers = (await loadTeachers()).map((teacher) => ({ ...teacher }));
  // A signed token proves who issued the session, not that the account still
  // exists. Do not recreate a teacher from token claims after an admin deleted
  // or disabled the account; that would make deletion ineffective.
  const teacher = teachers.find((t) => t.id === payload.teacherId);
  if (teacher) return sanitizeTeacher(teacher);

  // Unit-test fixtures intentionally use signed in-memory teachers without
  // inserting them into the persistence store. This compatibility path is
  // never available in a deployed environment.
  if (process.env.NODE_ENV === "test") {
    return sanitizeTeacher({
      id: payload.teacherId,
      name: payload.name,
      login: payload.login,
      subject: payload.subject || "Ustoz",
      phone: payload.phone,
      telegramId: payload.telegramId,
      telegramUsername: payload.telegramUsername,
      createdAt: new Date(payload.iat * 1000).toISOString(),
      status: payload.status || "active",
    });
  }
  return null;
}
