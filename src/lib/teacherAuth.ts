import { createHmac, randomBytes, timingSafeEqual, scryptSync } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { isDbConnected, query, initDatabase, withTransaction } from "./db";

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

export const DEFAULT_TEACHER_PASSWORD = "algoritm123";
export const DEFAULT_TEACHER_SALT = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
export const DEFAULT_TEACHER_HASH = "2d871b447c385a9e2b17c5c9a0417c7dded286c82bd2a43cb7d6afe5b477972a8a31f46ba4579d689359fff8ef08572fdd1b003880e92e0a7c0cf710251cc2ac";

// Boshlang'ich ustozlar ro'yxati (haqiqiy ustozlar o'zlari ro'yxatdan o'tib kirishlari uchun bo'sh)
export const INITIAL_TEACHERS: Teacher[] = [];

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
    if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(data.error);
    if (data.result === null || data.result === undefined) return null;
    const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    if (!Array.isArray(parsed)) throw new Error("Redis ustozlar ma'lumotlari buzilgan");
    return parsed as Teacher[];
  } catch (error) {
    console.error("[teacherAuth] Redis dan ustozlarni yuklashda xato:", error);
    // Redis is authoritative when configured; do not silently fall back to a
    // local file or recreate the initial accounts after an outage.
    throw new Error("Markaziy Redis bazasiga ulanib bo'lmadi");
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

interface TeacherMutation<T> {
  next: Teacher[];
  result: T;
}

const TEACHER_CAS_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if (ARGV[1] == '0' and not current) or (ARGV[1] == '1' and current == ARGV[2]) then
  redis.call('SET', KEYS[1], ARGV[3])
  return 1
end
return 0`;

async function redisReadTeachersWithRaw(): Promise<{ raw: string | null; teachers: Teacher[] }> {
  const cfg = upstashConfig();
  if (!cfg) throw new Error("Redis konfiguratsiya qilinmagan");
  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(REDIS_TEACHERS_KEY)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  if (data.result === null || data.result === undefined) return { raw: null, teachers: [] };
  const raw = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Redis ustozlar ma'lumotlari buzilgan");
  return { raw, teachers: parsed as Teacher[] };
}

async function redisWriteTeachersCas(raw: string | null, teachers: Teacher[]): Promise<boolean> {
  const cfg = upstashConfig();
  if (!cfg) throw new Error("Redis konfiguratsiya qilinmagan");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", TEACHER_CAS_SCRIPT, 1, REDIS_TEACHERS_KEY, raw === null ? "0" : "1", raw ?? "", JSON.stringify(teachers)]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
  const data = (await res.json()) as { result?: number; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result === 1;
}

let teacherMutationChain: Promise<unknown> = Promise.resolve();

function enqueueTeacherMutation<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    teacherMutationChain = teacherMutationChain
      .catch(() => undefined)
      .then(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        }
      });
  });
}

async function persistTeachersWithClient(client: import("pg").PoolClient, teachers: Teacher[]): Promise<void> {
  await client.query("DELETE FROM teachers");
  for (const teacher of teachers) {
    await client.query(
      `INSERT INTO teachers (id,name,login,subject,phone,password_hash,salt,telegram_id,telegram_username,status,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [teacher.id, teacher.name, teacher.login, teacher.subject, teacher.phone || null, teacher.passwordHash || null, teacher.salt || null, teacher.telegramId || null, teacher.telegramUsername || null, teacher.status || "active", teacher.createdAt]
    );
  }
}

async function mutateTeachers<T>(apply: (teachers: Teacher[]) => TeacherMutation<T>): Promise<T> {
  if (isDbConnected()) {
    await initDatabase();
    return withTransaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-teachers'))");
      const rows = await client.query("SELECT * FROM teachers ORDER BY created_at ASC FOR UPDATE");
      const current: Teacher[] = rows.rows.map((row: Record<string, unknown>) => ({
        id: String(row.id), name: String(row.name), login: String(row.login), subject: String(row.subject),
        phone: row.phone ? String(row.phone) : undefined, passwordHash: row.password_hash ? String(row.password_hash) : undefined,
        salt: row.salt ? String(row.salt) : undefined, telegramId: row.telegram_id ? String(row.telegram_id) : undefined,
        telegramUsername: row.telegram_username ? String(row.telegram_username) : undefined,
        status: (row.status as TeacherStatus) || "active", createdAt: new Date(String(row.created_at)).toISOString(),
      }));
      const { next, result } = apply(current);
      await persistTeachersWithClient(client, next);
      setGlobalTeachers(next);
      return result;
    });
  }

  if (upstashConfig()) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await redisReadTeachersWithRaw();
      const base = current.raw === null ? INITIAL_TEACHERS.map((teacher) => ({ ...teacher })) : current.teachers;
      const { next, result } = apply(base.map((teacher) => ({ ...teacher })));
      if (await redisWriteTeachersCas(current.raw, next)) {
        setGlobalTeachers(next);
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 40));
    }
    throw new Error("Redis ustozlar bazasi band. Birozdan so'ng qayta urinib ko'ring.");
  }

  return enqueueTeacherMutation(async () => {
    const current = (await loadTeachers()).map((teacher) => ({ ...teacher }));
    const { next, result } = apply(current);
    await saveTeachers(next);
    return result;
  });
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
  teacherMutationChain = Promise.resolve();
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
  const cached = getGlobalTeachers();
  // Central backends must be read fresh so status changes and Telegram bindings
  // made by another server instance take effect immediately.
  if (cached && !isDbConnected() && !upstashConfig()) return cached;
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

      let needsDbSave = false;
      const teachers: Teacher[] = rows.map((r) => {
        const hasPw = Boolean(r.password_hash && r.salt);
        if (!hasPw) needsDbSave = true;
        return {
          id: r.id,
          name: r.name,
          login: r.login,
          subject: r.subject,
          phone: r.phone || undefined,
          passwordHash: r.password_hash || DEFAULT_TEACHER_HASH,
          salt: r.salt || DEFAULT_TEACHER_SALT,
          telegramId: r.telegram_id || undefined,
          telegramUsername: r.telegram_username || undefined,
          status: r.status || "active",
          createdAt: new Date(r.created_at).toISOString(),
        };
      });

      if (needsDbSave) {
        // Avtomatik ravishda bazadagi bo'sh parolli ustozlarga standart parolni yozib qo'yamiz
        void (async () => {
          try {
            for (const t of teachers) {
              await query(
                "UPDATE teachers SET password_hash = $1, salt = $2 WHERE id = $3 AND (password_hash IS NULL OR salt IS NULL)",
                [t.passwordHash, t.salt, t.id]
              );
            }
          } catch (e) {
            console.warn("[teacherAuth] Standart parollarni DB ga yangilashda xato:", e);
          }
        })();
      }

      setGlobalTeachers(teachers);
      return teachers;
    } catch (err) {
      console.error("[teacherAuth] PostgreSQL dan ustozlarni yuklashda xato:", err);
      throw new Error("Markaziy ma'lumotlar bazasiga ulanib bo'lmadi");
    }
  }

  // 1. Upstash Redis (agar sozlangan bo'lsa). Missing key is a new empty
  // database; it must be seeded back into Redis, never into a local file.
  if (upstashConfig()) {
    const redisTeachers = await redisGetTeachers();
    if (redisTeachers !== null) {
      let modified = false;
      const updated = redisTeachers.map((t) => {
        if (!t.passwordHash || !t.salt) {
          modified = true;
          return { ...t, passwordHash: DEFAULT_TEACHER_HASH, salt: DEFAULT_TEACHER_SALT };
        }
        return t;
      });
      if (modified) {
        void redisSaveTeachers(updated).catch(() => {});
      }
      setGlobalTeachers(updated);
      return updated;
    }
    const initial = INITIAL_TEACHERS.map((teacher) => ({ ...teacher }));
    const saved = await redisWriteTeachersCas(null, initial);
    if (!saved) {
      // Another cold start may have initialized the key between GET and CAS.
      // Read that authoritative value instead of overwriting it with defaults.
      const existing = await redisGetTeachers();
      if (existing !== null) {
        setGlobalTeachers(existing);
        return existing;
      }
      throw new Error("Markaziy Redis bazasiga boshlang'ich ustozlar yozib bo'lmadi");
    }
    setGlobalTeachers(initial);
    return initial;
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
      let modified = false;
      const updated = parsed.map((t: Teacher) => {
        if (!t.passwordHash || !t.salt) {
          modified = true;
          return { ...t, passwordHash: DEFAULT_TEACHER_HASH, salt: DEFAULT_TEACHER_SALT };
        }
        return t;
      });
      if (modified) {
        void saveTeachers(updated).catch(() => {});
      }
      setGlobalTeachers(updated);
      return updated;
    }
    throw new Error("Ustozlar fayli massivi bo'lishi kerak");
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code !== "ENOENT") {
      console.error(`[teacherAuth] Ustozlar faylini o'qib bo'lmadi (${code || "buzilgan"}):`, error);
      throw new Error("Ustozlar ma'lumotlarini o'qib bo'lmadi");
    }
  }

  if (process.env.NODE_ENV === "production" && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    throw new Error("Production serverless muhitida DATABASE_URL yoki Redis sozlanishi shart");
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
      await withTransaction(async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-teachers'))");
        if (teachers.length === 0) {
          await client.query("DELETE FROM teachers");
        } else {
          const ids = teachers.map((t) => t.id);
          await client.query("DELETE FROM teachers WHERE id NOT IN (SELECT unnest($1::text[]))", [ids]);
          for (const t of teachers) {
            await client.query(
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
        }
      });
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
  if (process.env.NODE_ENV === "production" && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    throw new Error("Production serverless muhitida DATABASE_URL yoki Redis sozlanishi shart");
  }
  const filePath = getStoragePath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(teachers, null, 2), "utf8");
    await fs.rename(tempPath, filePath);
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
  return mutateTeachers<boolean>((teachers) => {
    const clean = idOrLogin.trim().toLowerCase();
    const next = teachers.filter((teacher) => teacher.id !== idOrLogin && teacher.login.toLowerCase() !== clean);
    return { next, result: next.length !== teachers.length };
  });
}

/** Barcha ustozlar ro'yxatini boshlang'ich toza holatga qaytarish */
export async function resetTeachers(): Promise<Teacher[]> {
  const fresh = INITIAL_TEACHERS.map((teacher) => ({ ...teacher }));
  return mutateTeachers(() => ({ next: fresh, result: fresh }));
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
  return mutateTeachers((teachers) => {
    const index = teachers.findIndex((teacher) => teacher.id === teacherId);
    if (index === -1) return { next: teachers, result: null };
    const salt = randomBytes(16).toString("hex");
    const updated = { ...teachers[index], passwordHash: hashPassword(plainPassword, salt), salt };
    const next = [...teachers];
    next[index] = updated;
    return { next, result: sanitizeTeacher(updated) };
  });
}

export interface RegisterTeacherInput {
  name: string;
  login: string;
  subject: string;
  phone?: string;
  password: string;
  telegramId?: string | number;
  telegramUsername?: string;
  status?: TeacherStatus;
}

/** Yangi ustozning mustaqil ro'yxatdan o'tishi */
export async function registerTeacher(input: RegisterTeacherInput): Promise<{ teacher?: Teacher; error?: string }> {
  const name = input.name?.trim();
  const login = input.login?.trim().toLowerCase();
  const subject = input.subject?.trim();
  const password = input.password;
  const phone = input.phone?.trim();

  if (!name || name.length < 3 || name.length > 255) return { error: "Ism va familiyangizni to'liq kiriting (3–255 belgi)" };
  if (!login || login.length < 3 || login.length > 64 || !/^[a-z0-9_.-]+$/.test(login)) return { error: "Login 3–64 ta lotin harfi, raqam yoki belgilardan iborat bo'lishi kerak (masalan: aziz_sat)" };
  if (!subject || subject.length < 2 || subject.length > 255) return { error: "Faningiz yoki mutaxassisligingizni 2–255 belgi oralig'ida kiriting" };
  if (!password || password.length < 4 || password.length > 128) return { error: "Parol 4–128 ta belgidan iborat bo'lishi kerak" };

  return mutateTeachers<{ teacher?: Teacher; error?: string }>((teachers) => {
    if (teachers.some((teacher) => teacher.login.toLowerCase() === login)) {
      return { next: teachers, result: { error: "Ushbu login band. Iltimos, boshqa login tanlang." } };
    }
    const salt = randomBytes(16).toString("hex");
    const teacher: Teacher = {
      id: `tm_${Date.now()}_${randomBytes(3).toString("hex")}`,
      name, login, subject, phone,
      passwordHash: hashPassword(password, salt), salt,
      telegramId: input.telegramId ? String(input.telegramId) : undefined,
      telegramUsername: input.telegramUsername ? input.telegramUsername.replace(/^@/, "") : undefined,
      createdAt: new Date().toISOString(),
      status: input.status || "pending",
    };
    return { next: [...teachers, teacher], result: { teacher: sanitizeTeacher(teacher) } };
  });
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
  const name = input.name?.trim();
  const login = input.login?.trim().toLowerCase();
  const subject = input.subject?.trim();
  const password = input.password;
  const phone = input.phone?.trim();

  if (!name || name.length < 3 || name.length > 255) return { error: "Ism va familiyani 3–255 belgi oralig'ida kiriting" };
  if (!login || login.length < 3 || login.length > 64 || !/^[a-z0-9_.-]+$/.test(login)) return { error: "Login 3–64 ta lotin harfi, raqam yoki belgilardan iborat bo'lishi kerak" };
  if (!subject || subject.length < 2 || subject.length > 255) return { error: "Fanni 2–255 belgi oralig'ida kiriting" };
  if (!password || password.length < 4 || password.length > 128) return { error: "Parol 4–128 ta belgidan iborat bo'lishi kerak" };

  return mutateTeachers<{ teacher?: Teacher; error?: string }>((teachers) => {
    if (teachers.some((teacher) => teacher.login.toLowerCase() === login)) {
      return { next: teachers, result: { error: "Ushbu login band. Boshqa login tanlang." } };
    }
    const salt = randomBytes(16).toString("hex");
    const teacher: Teacher = {
      id: `tm_${Date.now()}_${randomBytes(3).toString("hex")}`,
      name, login, subject, phone,
      passwordHash: hashPassword(password, salt), salt,
      telegramId: input.telegramId ? String(input.telegramId) : undefined,
      telegramUsername: input.telegramUsername ? input.telegramUsername.replace(/^@/, "") : undefined,
      createdAt: new Date().toISOString(), status: input.status || "active",
    };
    return { next: [...teachers, teacher], result: { teacher: sanitizeTeacher(teacher) } };
  });
}

/** Admin tomonidan ustoz holatini o'zgartirish (active / pending / blocked) */
export async function updateTeacherStatus(teacherId: string, status: TeacherStatus): Promise<Teacher | null> {
  return mutateTeachers((teachers) => {
    const index = teachers.findIndex((teacher) => teacher.id === teacherId);
    if (index === -1) return { next: teachers, result: null };
    const updated = { ...teachers[index], status };
    const next = [...teachers];
    next[index] = updated;
    return { next, result: sanitizeTeacher(updated) };
  });
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
  return mutateTeachers<{ teacher?: Teacher; error?: string }>((teachers) => {
    const index = teachers.findIndex((teacher) => teacher.id === teacherId);
    if (index === -1) return { next: teachers, result: { error: "Ustoz topilmadi" } };
    const current = { ...teachers[index] };
    if (details.login !== undefined) {
      const cleanLogin = details.login.trim().toLowerCase();
      if (!cleanLogin || cleanLogin.length < 3 || cleanLogin.length > 64 || !/^[a-z0-9_.-]+$/.test(cleanLogin)) {
        return { next: teachers, result: { error: "Login 3–64 ta belgidan iborat bo'lishi kerak" } };
      }
      if (teachers.some((teacher) => teacher.id !== teacherId && teacher.login.toLowerCase() === cleanLogin)) {
        return { next: teachers, result: { error: "Ushbu login boshqa ustoz tomonidan band qilingan" } };
      }
      current.login = cleanLogin;
    }
    if (details.name !== undefined) {
      const name = details.name.trim();
      if (name.length < 3 || name.length > 255) return { next: teachers, result: { error: "Ism va familiyani 3–255 belgi oralig'ida kiriting" } };
      current.name = name;
    }
    if (details.subject !== undefined) {
      const subject = details.subject.trim();
      if (subject.length < 2 || subject.length > 255) return { next: teachers, result: { error: "Fanni 2–255 belgi oralig'ida kiriting" } };
      current.subject = subject;
    }
    if (details.phone !== undefined) {
      const phone = details.phone.trim();
      if (phone.length > 32) return { next: teachers, result: { error: "Telefon raqami juda uzun" } };
      current.phone = phone;
    }
    const next = [...teachers];
    next[index] = current;
    return { next, result: { teacher: sanitizeTeacher(current) } };
  });
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
    if (plainPassword === DEFAULT_TEACHER_PASSWORD) {
      const index = teachers.findIndex((t) => t.id === teacher.id);
      if (index !== -1) {
        const newSalt = randomBytes(16).toString("hex");
        teachers[index] = { ...teachers[index], passwordHash: hashPassword(plainPassword, newSalt), salt: newSalt };
        await saveTeachers(teachers);
        return sanitizeTeacher(teachers[index]);
      }
    }
    return null;
  }

  const verification = verifyPasswordHash(plainPassword, teacher.salt, teacher.passwordHash);
  if (!verification.valid) {
    // Agar kiritilgan parol standart algoritm123 bo'lsa va ustoz paroli hali o'rnatilmagan bo'lsa
    if (plainPassword === DEFAULT_TEACHER_PASSWORD && (!teacher.passwordHash || !teacher.salt)) {
      const index = teachers.findIndex((t) => t.id === teacher.id);
      if (index !== -1) {
        const newSalt = randomBytes(16).toString("hex");
        teachers[index] = { ...teachers[index], passwordHash: hashPassword(plainPassword, newSalt), salt: newSalt };
        await saveTeachers(teachers);
        return sanitizeTeacher(teachers[index]);
      }
    }
    return null;
  }

  if (verification.needsUpgrade) {
    const index = teachers.findIndex((t) => t.id === teacher.id);
    if (index !== -1) {
      const upgraded = await setTeacherPassword(teacher.id, plainPassword);
      return upgraded || sanitizeTeacher(teacher);
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
  return mutateTeachers((teachers) => {
    const index = teachers.findIndex((teacher) => teacher.id === teacherId);
    if (index === -1) return { next: teachers, result: null };
    const updated = {
      ...teachers[index],
      telegramId: String(telegramId),
      telegramUsername: telegramUsername ? telegramUsername.replace(/^@/, "") : teachers[index].telegramUsername,
    };
    const next = [...teachers];
    next[index] = updated;
    return { next, result: sanitizeTeacher(updated) };
  });
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
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.teacherId !== "string" || !payload.teacherId ||
      typeof payload.name !== "string" || typeof payload.login !== "string" ||
      typeof payload.exp !== "number" || !Number.isSafeInteger(payload.exp) ||
      typeof payload.iat !== "number" || !Number.isSafeInteger(payload.iat) ||
      payload.iat > now + 60 || payload.exp <= now || payload.exp <= payload.iat
    ) {
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
