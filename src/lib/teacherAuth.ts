import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

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
  },
  {
    id: "tm-jasur",
    name: "Jasur Jovliyev",
    login: "jasur",
    subject: "Ingliz Tili · IELTS",
    phone: "+998901234502",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "tm-oxunjon",
    name: "Oxunjon Ozodov",
    login: "oxunjon",
    subject: "Digital SAT",
    phone: "+998901234503",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "tm-adham",
    name: "Adham Sohibov",
    login: "adham",
    subject: "Prezident Maktabi & Mantiq",
    phone: "+998901234504",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "tm-shohista",
    name: "Shohista Jalilovna",
    login: "shohista",
    subject: "Boshlang'ich Rus Sinf",
    phone: "+998901234505",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "tm-bobur",
    name: "Bobur Xaydarov",
    login: "bobur",
    subject: "Asoschi & SAT Math",
    phone: "+998901234506",
    createdAt: "2026-09-01T00:00:00.000Z",
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
function getGlobalTeachers(): Teacher[] | null {
  const g = globalThis as any;
  return g.__algoritm_teachers__ || null;
}

function setGlobalTeachers(teachers: Teacher[]): void {
  const g = globalThis as any;
  g.__algoritm_teachers__ = teachers;
}

function getStoragePath(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  return isServerless
    ? path.join(os.tmpdir(), "algoritm_teachers.json")
    : path.join(process.cwd(), ".data", "teachers.json");
}

export async function loadTeachers(): Promise<Teacher[]> {
  const cached = getGlobalTeachers();
  if (cached && cached.length > 0) return cached;

  // 1. Upstash Redis (agar sozlangan bo'lsa)
  const redisTeachers = await redisGetTeachers();
  if (redisTeachers && redisTeachers.length > 0) {
    setGlobalTeachers(redisTeachers);
    return redisTeachers;
  }

  // 2. Mahalliy yoki vaqtinchalik fayl tizimi
  const filePath = getStoragePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      setGlobalTeachers(parsed);
      return parsed;
    }
  } catch {
    // Fayl mavjud emas bo'lsa boshlang'ich ma'lumotlar ishlatiladi
  }

  const initial = [...INITIAL_TEACHERS];
  setGlobalTeachers(initial);
  await saveTeachers(initial).catch(() => {});
  return initial;
}

export async function saveTeachers(teachers: Teacher[]): Promise<void> {
  setGlobalTeachers(teachers);

  // 1. Upstash Redis ga yozish
  await redisSaveTeachers(teachers).catch(() => {});

  // 2. Fayl tizimiga yozish
  const filePath = getStoragePath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(teachers, null, 2), "utf8");
  } catch (err) {
    console.error("[teacherAuth] Ustozlar ma'lumotlarini saqlashda xato:", err);
  }
}

/** Ustozni id yoki login orqali o'chirish */
export async function deleteTeacher(idOrLogin: string): Promise<boolean> {
  const teachers = await loadTeachers();
  const clean = idOrLogin.trim().toLowerCase();
  const filtered = teachers.filter(
    (t) => t.id !== idOrLogin && t.login.toLowerCase() !== clean
  );
  if (filtered.length === teachers.length) return false;
  await saveTeachers(filtered);
  return true;
}

/** Barcha ustozlar ro'yxatini boshlang'ich toza holatga qaytarish */
export async function resetTeachers(): Promise<Teacher[]> {
  const fresh = [...INITIAL_TEACHERS];
  await saveTeachers(fresh);
  return fresh;
}

/** Parolni xavfsiz HMAC-SHA256 xesh qilish */
export function hashPassword(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
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
  const teachers = await loadTeachers();
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
  const teachers = await loadTeachers();
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
  };

  teachers.push(newTeacher);
  await saveTeachers(teachers);

  return { teacher: sanitizeTeacher(newTeacher) };
}

/** Login yoki telefon hamda parol bilan tekshirish */
export async function verifyTeacherCredentials(
  loginOrPhone: string,
  plainPassword: string
): Promise<Teacher | null> {
  const teachers = await loadTeachers();
  const clean = loginOrPhone.trim().toLowerCase();
  const digits = clean.replace(/\D/g, "");

  const teacher = teachers.find((t) => {
    if (t.login.toLowerCase() === clean) return true;
    if (t.phone && t.phone.replace(/\D/g, "") === digits && digits.length >= 9) return true;
    return false;
  });

  if (!teacher) return null;

  // Agar ustoz hali parol o'rnatmagan bo'lsa
  if (!teacher.passwordHash || !teacher.salt) {
    return null;
  }

  const computedHash = hashPassword(plainPassword, teacher.salt);
  if (!safeEqual(computedHash, teacher.passwordHash)) {
    return null;
  }

  return sanitizeTeacher(teacher);
}

/** Telegram ID orqali ustozni topish */
export async function findTeacherByTelegram(
  telegramId: string | number,
  username?: string
): Promise<Teacher | null> {
  const teachers = await loadTeachers();
  const idStr = String(telegramId);
  const userStr = username ? username.replace(/^@/, "").toLowerCase() : null;

  const match = teachers.find((t) => {
    if (t.telegramId && t.telegramId === idStr) return true;
    if (userStr && t.telegramUsername && t.telegramUsername.toLowerCase() === userStr) return true;
    return false;
  });

  return match ? sanitizeTeacher(match) : null;
}

/** Ustoz profiliga Telegram ma'lumotlarini biriktirish */
export async function bindTeacherTelegram(
  teacherId: string,
  telegramId: string | number,
  telegramUsername?: string
): Promise<Teacher | null> {
  const teachers = await loadTeachers();
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
  const { passwordHash, salt, ...safe } = teacher;
  return safe as Teacher;
}

// ─────────────────────── Sessiya Tokenlari (HMAC Imzo) ───────────────────────

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.TELEGRAM_BOT_TOKEN || "algoritm-teacher-secret-salt-2026";
  return createHmac("sha256", "teacher-token-salt").update(secret).digest("hex");
}

export interface TeacherSessionPayload {
  teacherId: string;
  name: string;
  login: string;
  iat: number;
  exp: number;
}

export function createTeacherToken(teacher: Teacher, ttlSeconds = TEACHER_SESSION_TTL): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TeacherSessionPayload = {
    teacherId: teacher.id,
    name: teacher.name,
    login: teacher.login,
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

  const teachers = await loadTeachers();
  const teacher = teachers.find((t) => t.id === payload.teacherId);
  return teacher ? sanitizeTeacher(teacher) : null;
}
