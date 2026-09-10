// Algoritm Ecosystem — Attendance, Group and Student Store
// Serverless va lokal muhitda qotmasdan, atomic write va xotira keshi bilan ishlaydi.

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { isDbConnected, query, initDatabase, withTransaction } from "./db";
import type {
  Group,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  DaySchedule,
  StudentStatus,
  StudentMonthlyBilling,
} from "./attendanceTypes";

interface AttendanceStoreData {
  groups: Group[];
  students: Student[];
  records: AttendanceRecord[];
}

const INITIAL_GROUPS: Group[] = [
  {
    id: "grp_sat_aziz",
    name: "SAT Math Intensive",
    subject: "Matematika & SAT Math",
    teacherId: "tm-aziz",
    teacherName: "Aziz Xolmurodov",
    days: "dush-chor-juma",
    time: "14:00 - 15:30",
    room: "201-xona",
    monthlyPrice: 450000,
    lessonsPerMonth: 12,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "grp_ielts_jasur",
    name: "IELTS 7+ Graduation",
    subject: "Ingliz Tili · IELTS",
    teacherId: "tm-jasur",
    teacherName: "Jasur Jovliyev",
    days: "sesh-pay-shanba",
    time: "16:00 - 17:30",
    room: "105-xona",
    monthlyPrice: 400000,
    lessonsPerMonth: 12,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "grp_sat_oxunjon",
    name: "Digital SAT Verbal & Math",
    subject: "Digital SAT",
    teacherId: "tm-oxunjon",
    teacherName: "Oxunjon Ozodov",
    days: "dush-chor-juma",
    time: "16:00 - 17:30",
    room: "203-xona",
    monthlyPrice: 500000,
    lessonsPerMonth: 12,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "grp_pmt_adham",
    name: "Prezident Maktabi Tanqidiy Fikr",
    subject: "Prezident Maktabi & Matematika",
    teacherId: "tm-adham",
    teacherName: "Adham Sohibov",
    days: "sesh-pay-shanba",
    time: "14:00 - 15:30",
    room: "102-xona",
    monthlyPrice: 450000,
    lessonsPerMonth: 12,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "grp_rus_shohista",
    name: "Boshlang'ich Rus Sinf Savodxonlik",
    subject: "Boshlang'ich Rus Sinf",
    teacherId: "tm-shohista",
    teacherName: "Shohista Jalilovna",
    days: "har-kuni",
    time: "08:30 - 12:30",
    room: "Maktab 1-xona",
    monthlyPrice: 600000,
    lessonsPerMonth: 20,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: "std_101",
    name: "Sardorbek Alimov",
    phone: "+998 90 123 45 67",
    parentPhone: "+998 90 765 43 21",
    groupId: "grp_sat_aziz",
    enrolledAt: "2026-09-01T08:00:00.000Z",
    status: "faol",
  },
  {
    id: "std_102",
    name: "Madinabonu Karimova",
    phone: "+998 91 234 56 78",
    parentPhone: "+998 91 876 54 32",
    groupId: "grp_sat_aziz",
    enrolledAt: "2026-09-01T08:00:00.000Z",
    status: "faol",
  },
  {
    id: "std_103",
    name: "Javohir Toshmatov",
    phone: "+998 93 345 67 89",
    parentPhone: "+998 93 987 65 43",
    groupId: "grp_sat_aziz",
    enrolledAt: "2026-09-02T09:00:00.000Z",
    status: "faol",
  },
  {
    id: "std_104",
    name: "Diyorbek Yusupov",
    phone: "+998 94 456 78 90",
    parentPhone: "+998 94 098 76 54",
    groupId: "grp_ielts_jasur",
    enrolledAt: "2026-09-01T09:00:00.000Z",
    status: "faol",
  },
  {
    id: "std_105",
    name: "Zilola Boboyeva",
    phone: "+998 97 567 89 01",
    parentPhone: "+998 97 109 87 65",
    groupId: "grp_ielts_jasur",
    enrolledAt: "2026-09-01T10:00:00.000Z",
    status: "faol",
  },
];

let cache: AttendanceStoreData | null = null;
let writeChain: Promise<void> = Promise.resolve();

function cloneStoreData(data: AttendanceStoreData): AttendanceStoreData {
  return {
    groups: data.groups.map((group) => ({ ...group })),
    students: data.students.map((student) => ({ ...student })),
    records: data.records.map((record) => ({ ...record })),
  };
}

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

const REDIS_ATTENDANCE_KEY = process.env.ATTENDANCE_REDIS_KEY || "algoritm:attendance";

async function redisGetAttendance(): Promise<AttendanceStoreData | null> {
  const cfg = upstashConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/get/${encodeURIComponent(REDIS_ATTENDANCE_KEY)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(data.error);
    // null means a correctly reachable Redis key that has not been created yet.
    if (data.result === null || data.result === undefined) return null;
    const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    if (!parsed || !Array.isArray((parsed as AttendanceStoreData).groups) || !Array.isArray((parsed as AttendanceStoreData).students)) {
      throw new Error("Redis davomat ma'lumotlari buzilgan");
    }
    return {
      groups: (parsed as AttendanceStoreData).groups,
      students: (parsed as AttendanceStoreData).students,
      records: Array.isArray((parsed as AttendanceStoreData).records) ? (parsed as AttendanceStoreData).records : [],
    };
  } catch (error) {
    console.error("[attendanceStore] Redis dan yuklashda xato:", error);
    // A configured Redis backend is authoritative. Never silently switch to a
    // local file after an outage or malformed response.
    throw new Error("Markaziy Redis bazasiga ulanib bo'lmadi");
  }
}

async function redisReadWithRawAttendance(): Promise<{ raw: string | null; data: AttendanceStoreData | null }> {
  const cfg = upstashConfig();
  if (!cfg) throw new Error("Redis konfiguratsiya qilinmagan");
  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(REDIS_ATTENDANCE_KEY)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
  const result = (await res.json()) as { result?: unknown; error?: string };
  if (result.error) throw new Error(result.error);
  if (result.result === null || result.result === undefined) return { raw: null, data: null };
  const raw = typeof result.result === "string" ? result.result : JSON.stringify(result.result);
  const parsed = JSON.parse(raw) as AttendanceStoreData;
  if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.students)) {
    throw new Error("Redis davomat ma'lumotlari buzilgan");
  }
  return {
    raw,
    data: {
      groups: parsed.groups,
      students: parsed.students,
      records: Array.isArray(parsed.records) ? parsed.records : [],
    },
  };
}

const REDIS_ATTENDANCE_CAS_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if (ARGV[1] == '0' and not current) or (ARGV[1] == '1' and current == ARGV[2]) then
  redis.call('SET', KEYS[1], ARGV[3])
  return 1
end
return 0`;

async function redisWriteAttendanceCas(raw: string | null, data: AttendanceStoreData): Promise<boolean> {
  const cfg = upstashConfig();
  if (!cfg) throw new Error("Redis konfiguratsiya qilinmagan");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      "EVAL",
      REDIS_ATTENDANCE_CAS_SCRIPT,
      1,
      REDIS_ATTENDANCE_KEY,
      raw === null ? "0" : "1",
      raw ?? "",
      JSON.stringify(data),
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis xatosi (${res.status})`);
  const result = (await res.json()) as { result?: number; error?: string };
  if (result.error) throw new Error(result.error);
  return result.result === 1;
}

async function redisSaveAttendance(data: AttendanceStoreData): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await redisReadWithRawAttendance();
    if (await redisWriteAttendanceCas(current.raw, data)) return true;
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 40));
  }
  return false;
}

function storeFilePath(): string {
  if (process.env.ATTENDANCE_FILE) return process.env.ATTENDANCE_FILE;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "attendance_data.json");
  }
  return path.join(process.cwd(), ".data", "attendance_data.json");
}

let attendanceFileMtime = 0;

export function isEphemeralAttendanceStorage(): boolean {
  return !isDbConnected() && !upstashConfig() && Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function loadData(): Promise<AttendanceStoreData> {
  // 0. PostgreSQL (Supabase / Neon / Vercel Postgres)
  if (isDbConnected()) {
    try {
      await initDatabase();
      const groupRows = await query<{
        id: string;
        name: string;
        subject: string;
        teacher_id: string;
        teacher_name: string;
        days: string;
        time: string;
        room: string;
        monthly_price: string | number;
        lessons_per_month: number;
        active: boolean;
        telegram_id?: string | null;
        telegram_username?: string | null;
        created_at: Date | string;
      }>("SELECT * FROM groups ORDER BY created_at ASC");

      const studentRows = await query<{
        id: string;
        name: string;
        phone: string;
        parent_phone?: string | null;
        group_id: string;
        status: StudentStatus;
        notes?: string | null;
        enrolled_at: Date | string;
      }>("SELECT * FROM students ORDER BY enrolled_at ASC");

      const recordRows = await query<{
        id: string;
        group_id: string;
        student_id: string;
        date: string | Date;
        status: AttendanceStatus;
        note?: string | null;
        marked_by: string;
        marked_at: Date | string;
      }>("SELECT * FROM attendance_records ORDER BY date DESC, marked_at DESC");

      if (groupRows.length === 0) {
        const marker = await query<{ value: string }>("SELECT value FROM app_metadata WHERE key = $1", ["attendance_seeded"]);
        if (marker.length === 0) {
          for (const g of INITIAL_GROUPS) {
            await query(
              `INSERT INTO groups (id, name, subject, teacher_id, teacher_name, days, time, room, monthly_price, lessons_per_month, active, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               ON CONFLICT (id) DO NOTHING`,
              [g.id, g.name, g.subject, g.teacherId, g.teacherName, g.days, g.time, g.room, g.monthlyPrice, g.lessonsPerMonth, g.active, g.createdAt]
            );
          }
          for (const s of INITIAL_STUDENTS) {
            await query(
              `INSERT INTO students (id, name, phone, parent_phone, group_id, status, enrolled_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO NOTHING`,
              [s.id, s.name, s.phone, s.parentPhone || null, s.groupId, s.status, s.enrolledAt]
            );
          }
          await query(
            "INSERT INTO app_metadata (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
            ["attendance_seeded", new Date().toISOString()]
          );
          cache = {
            groups: INITIAL_GROUPS.map((group) => ({ ...group })),
            students: INITIAL_STUDENTS.map((student) => ({ ...student })),
            records: [],
          };
          return cache;
        }
        cache = { groups: [], students: [], records: [] };
        return cache;
      }

      const groups: Group[] = groupRows.map((r) => ({
        id: r.id,
        name: r.name,
        subject: r.subject,
        teacherId: r.teacher_id,
        teacherName: r.teacher_name,
        days: (r.days as DaySchedule) || "dush-chor-juma",
        time: r.time,
        room: r.room,
        monthlyPrice: Number(r.monthly_price),
        lessonsPerMonth: Number(r.lessons_per_month),
        active: Boolean(r.active),
        telegramId: r.telegram_id || undefined,
        telegramUsername: r.telegram_username || undefined,
        createdAt: new Date(r.created_at).toISOString(),
      }));

      const students: Student[] = studentRows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        parentPhone: r.parent_phone || undefined,
        groupId: r.group_id,
        status: r.status,
        notes: r.notes || undefined,
        enrolledAt: new Date(r.enrolled_at).toISOString(),
      }));

      const records: AttendanceRecord[] = recordRows.map((r) => ({
        id: r.id,
        groupId: r.group_id,
        studentId: r.student_id,
        date: typeof r.date === "string" ? r.date.slice(0, 10) : new Date(r.date).toISOString().slice(0, 10),
        status: r.status,
        note: r.note || undefined,
        markedBy: r.marked_by,
        markedAt: new Date(r.marked_at).toISOString(),
      }));

      cache = { groups, students, records };
      return cache;
    } catch (err) {
      console.error("[attendanceStore] PostgreSQL dan yuklashda xato:", err);
      // DATABASE_URL is an explicit production choice. Falling back to a local
      // file after a database outage would report successful writes that are
      // invisible to other instances and can silently split the data set.
      throw new Error("Markaziy ma'lumotlar bazasiga ulanib bo'lmadi");
    }
  }

  // 1. Upstash Redis (agar sozlangan bo'lsa). Missing key is an empty/new
  // database, not a reason to read a local file.
  if (upstashConfig()) {
    const redisData = await redisGetAttendance();
    if (redisData) {
      cache = redisData;
      return cache;
    }
    const initialData: AttendanceStoreData = {
      groups: INITIAL_GROUPS.map((group) => ({ ...group })),
      students: INITIAL_STUDENTS.map((student) => ({ ...student })),
      records: [],
    };
    if (!(await redisSaveAttendance(initialData))) {
      // Another cold start may have initialized the key between GET and CAS.
      // Read that authoritative value rather than reporting a false seed error.
      const existing = await redisGetAttendance();
      if (existing) {
        cache = existing;
        return existing;
      }
      throw new Error("Markaziy Redis bazasiga boshlang'ich ma'lumot yozib bo'lmadi");
    }
    cache = initialData;
    return cache;
  }

  // 2. Fayl tizimi (lokal/test fallback)
  if (process.env.NODE_ENV === "production" && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    throw new Error("Production serverless muhitida DATABASE_URL yoki Redis sozlanishi shart");
  }
  const file = storeFilePath();
  try {
    const stat = await fs.stat(file);
    if (cache && stat.mtimeMs === attendanceFileMtime) {
      return cache;
    }
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.students)) {
      throw new Error("Davomat fayli noto'g'ri formatda");
    }
    attendanceFileMtime = stat.mtimeMs;
    cache = {
      groups: parsed.groups,
      students: parsed.students,
      records: Array.isArray(parsed.records) ? parsed.records : [],
    };
    return cache;
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code !== "ENOENT") {
      console.error(`[attendanceStore] Davomat faylini o'qishda xatolik (${code || "buzilgan"}):`, error);
      throw new Error("Davomat ma'lumotlarini o'qib bo'lmadi");
    }
  }

  const initialData: AttendanceStoreData = {
    groups: INITIAL_GROUPS.map((group) => ({ ...group })),
    students: INITIAL_STUDENTS.map((student) => ({ ...student })),
    records: [],
  };
  await persistData(initialData);
  cache = initialData;
  return cache;
}

async function persistData(data: AttendanceStoreData): Promise<void> {
  // 0. PostgreSQL (agar sozlangan bo'lsa)
  if (isDbConnected()) {
    try {
      await initDatabase();
      await withTransaction(async (client) => {
      for (const g of data.groups) {
        await client.query(
          `INSERT INTO groups (id, name, subject, teacher_id, teacher_name, days, time, room, monthly_price, lessons_per_month, active, telegram_id, telegram_username, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             subject = EXCLUDED.subject,
             teacher_id = EXCLUDED.teacher_id,
             teacher_name = EXCLUDED.teacher_name,
             days = EXCLUDED.days,
             time = EXCLUDED.time,
             room = EXCLUDED.room,
             monthly_price = EXCLUDED.monthly_price,
             lessons_per_month = EXCLUDED.lessons_per_month,
             active = EXCLUDED.active,
             telegram_id = EXCLUDED.telegram_id,
             telegram_username = EXCLUDED.telegram_username`,
          [g.id, g.name, g.subject, g.teacherId, g.teacherName, g.days, g.time, g.room, g.monthlyPrice, g.lessonsPerMonth, g.active, g.telegramId || null, g.telegramUsername || null, g.createdAt]
        );
      }
      for (const s of data.students) {
        await client.query(
          `INSERT INTO students (id, name, phone, parent_phone, group_id, status, notes, enrolled_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             parent_phone = EXCLUDED.parent_phone,
             group_id = EXCLUDED.group_id,
             status = EXCLUDED.status,
             notes = EXCLUDED.notes`,
          [s.id, s.name, s.phone, s.parentPhone || null, s.groupId, s.status, s.notes || null, s.enrolledAt]
        );
      }
      for (const r of data.records) {
        await client.query(
          `INSERT INTO attendance_records (id, group_id, student_id, date, status, note, marked_by, marked_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (group_id, student_id, date) DO UPDATE SET
             status = EXCLUDED.status,
             note = EXCLUDED.note,
             marked_by = EXCLUDED.marked_by,
             marked_at = EXCLUDED.marked_at`,
          [r.id, r.groupId, r.studentId, r.date, r.status, r.note || null, r.markedBy, r.markedAt]
        );
      }
      });
    } catch (err) {
      console.error("[attendanceStore] PostgreSQL ga saqlashda xato:", err);
      throw new Error("Markaziy ma'lumotlar bazasiga saqlab bo'lmadi");
    }
    // PostgreSQL is authoritative; do not require a best-effort local mirror.
    cache = data;
    return;
  }

  // 1. Upstash Redis ga yozish (agar sozlangan bo'lsa)
  if (upstashConfig()) {
    const saved = await redisSaveAttendance(data);
    if (!saved) throw new Error("Markaziy Redis bazasiga saqlab bo'lmadi");
    cache = data;
    return;
  }

  // 2. Fayl tizimiga yozish
  const file = storeFilePath();
  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
        const tmp = file + "." + process.pid + "." + Date.now() + ".tmp";
        await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
        await fs.rename(tmp, file);
        const stat = await fs.stat(file).catch(() => null);
        attendanceFileMtime = stat?.mtimeMs || Date.now();
      } catch (err) {
        console.error("[attendanceStore] Diskka yozib bo'lmadi:", err);
        throw new Error("Davomat ma'lumotlarini saqlab bo'lmadi");
      }
      cache = data;
    });
  await writeChain;
}

function mapDbGroupRow(row: Record<string, unknown>): Group {
  return {
    id: String(row.id), name: String(row.name), subject: String(row.subject),
    teacherId: String(row.teacher_id), teacherName: String(row.teacher_name),
    days: row.days as DaySchedule, time: String(row.time), room: String(row.room),
    monthlyPrice: Number(row.monthly_price), lessonsPerMonth: Number(row.lessons_per_month),
    active: Boolean(row.active), telegramId: row.telegram_id ? String(row.telegram_id) : undefined,
    telegramUsername: row.telegram_username ? String(row.telegram_username) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapDbStudentRow(row: Record<string, unknown>): Student {
  return {
    id: String(row.id), name: String(row.name), phone: String(row.phone),
    parentPhone: row.parent_phone ? String(row.parent_phone) : undefined,
    groupId: String(row.group_id), status: row.status as StudentStatus,
    notes: row.notes ? String(row.notes) : undefined,
    enrolledAt: new Date(String(row.enrolled_at)).toISOString(),
  };
}

async function postgresCreateGroup(input: Omit<Group, "id" | "createdAt"> & { id?: string }): Promise<Group> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-groups'))");
    const id = input.id || "grp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const result = await client.query(`INSERT INTO groups (id,name,subject,teacher_id,teacher_name,days,time,room,monthly_price,lessons_per_month,active,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [id,input.name,input.subject,input.teacherId,input.teacherName,input.days,input.time,input.room,input.monthlyPrice,input.lessonsPerMonth,input.active !== false,new Date().toISOString()]);
    cache = null;
    return mapDbGroupRow(result.rows[0] as Record<string, unknown>);
  });
}

async function postgresUpdateGroup(id: string, patch: Partial<Group>): Promise<Group | null> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-groups'))");
    const selected = await client.query("SELECT * FROM groups WHERE id = $1 FOR UPDATE", [id]);
    if (!selected.rows[0]) return null;
    const row = selected.rows[0] as Record<string, unknown>;
    const value = {
      name: patch.name ?? row.name, subject: patch.subject ?? row.subject,
      teacherId: patch.teacherId ?? row.teacher_id, teacherName: patch.teacherName ?? row.teacher_name,
      days: patch.days ?? row.days, time: patch.time ?? row.time, room: patch.room ?? row.room,
      monthlyPrice: patch.monthlyPrice ?? Number(row.monthly_price), lessonsPerMonth: patch.lessonsPerMonth ?? Number(row.lessons_per_month),
      active: patch.active ?? Boolean(row.active),
    };
    const result = await client.query(`UPDATE groups SET name=$1,subject=$2,teacher_id=$3,teacher_name=$4,days=$5,time=$6,room=$7,monthly_price=$8,lessons_per_month=$9,active=$10 WHERE id=$11 RETURNING *`, [value.name,value.subject,value.teacherId,value.teacherName,value.days,value.time,value.room,value.monthlyPrice,value.lessonsPerMonth,value.active,id]);
    cache = null;
    return mapDbGroupRow(result.rows[0] as Record<string, unknown>);
  });
}

async function postgresDeleteGroup(id: string): Promise<boolean> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-groups'))");
    const result = await client.query("DELETE FROM groups WHERE id = $1", [id]);
    cache = null;
    return (result.rowCount || 0) > 0;
  });
}

async function postgresCreateStudent(input: Omit<Student, "id" | "enrolledAt"> & { id?: string }): Promise<Student> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-students'))");
    const id = input.id || "std_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const result = await client.query(`INSERT INTO students (id,name,phone,parent_phone,group_id,status,notes,enrolled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [id,input.name,input.phone,input.parentPhone || null,input.groupId,input.status,input.notes || null,new Date().toISOString()]);
    cache = null;
    return mapDbStudentRow(result.rows[0] as Record<string, unknown>);
  });
}

async function postgresUpdateStudent(id: string, patch: Partial<Student>): Promise<Student | null> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-students'))");
    const selected = await client.query("SELECT * FROM students WHERE id = $1 FOR UPDATE", [id]);
    if (!selected.rows[0]) return null;
    const row = selected.rows[0] as Record<string, unknown>;
    const value = {
      name: patch.name ?? row.name, phone: patch.phone ?? row.phone,
      parentPhone: patch.parentPhone !== undefined ? patch.parentPhone : row.parent_phone,
      groupId: patch.groupId ?? row.group_id, status: patch.status ?? row.status,
      notes: patch.notes !== undefined ? patch.notes : row.notes,
    };
    const result = await client.query(`UPDATE students SET name=$1,phone=$2,parent_phone=$3,group_id=$4,status=$5,notes=$6 WHERE id=$7 RETURNING *`, [value.name,value.phone,value.parentPhone || null,value.groupId,value.status,value.notes || null,id]);
    cache = null;
    return mapDbStudentRow(result.rows[0] as Record<string, unknown>);
  });
}

async function postgresDeleteStudent(id: string): Promise<boolean> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-students'))");
    const result = await client.query("DELETE FROM students WHERE id = $1", [id]);
    cache = null;
    return (result.rowCount || 0) > 0;
  });
}

async function postgresRecordAttendance(items: Array<Omit<AttendanceRecord, "id" | "markedAt">>): Promise<{ savedCount: number }> {
  await initDatabase();
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('algoritm-attendance-records'))");
    const markedAt = new Date().toISOString();
    for (const item of items) {
      await client.query(`INSERT INTO attendance_records (id,group_id,student_id,date,status,note,marked_by,marked_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (group_id,student_id,date) DO UPDATE SET status=EXCLUDED.status,note=EXCLUDED.note,marked_by=EXCLUDED.marked_by,marked_at=EXCLUDED.marked_at`, ["att_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),item.groupId,item.studentId,item.date,item.status,item.note || null,item.markedBy,markedAt]);
    }
    cache = null;
    return { savedCount: items.length };
  });
}

type AttendanceMutation<T> = (data: AttendanceStoreData) => { data: AttendanceStoreData; result: T };
let mutationChain: Promise<unknown> = Promise.resolve();

function enqueueLocalMutation<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    mutationChain = mutationChain
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

async function mutateAttendance<T>(apply: AttendanceMutation<T>): Promise<T> {
  if (upstashConfig()) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await redisReadWithRawAttendance();
      const base = current.data || {
        groups: INITIAL_GROUPS.map((group) => ({ ...group })),
        students: INITIAL_STUDENTS.map((student) => ({ ...student })),
        records: [],
      };
      const { data, result } = apply(cloneStoreData(base));
      if (await redisWriteAttendanceCas(current.raw, data)) {
        cache = data;
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 40));
    }
    throw new Error("Redis ma'lumotlar bazasi band. Birozdan so'ng qayta urinib ko'ring.");
  }

  return enqueueLocalMutation(async () => {
    const data = cloneStoreData(await loadData());
    const { data: next, result } = apply(data);
    await persistData(next);
    cache = next;
    return result;
  });
}

// ──────────────── Guruhlar (Groups) ────────────────
export async function listGroups(filter?: {
  teacherId?: string;
  activeOnly?: boolean;
}): Promise<Group[]> {
  const data = await loadData();
  let result = data.groups;
  if (filter?.teacherId) {
    result = result.filter((g) => g.teacherId === filter.teacherId);
  }
  if (filter?.activeOnly) {
    result = result.filter((g) => g.active);
  }
  return result;
}

export async function getGroup(id: string): Promise<Group | null> {
  const data = await loadData();
  return data.groups.find((g) => g.id === id) ?? null;
}

export async function createGroup(
  input: Omit<Group, "id" | "createdAt"> & { id?: string }
): Promise<Group> {
  if (isDbConnected()) return postgresCreateGroup(input);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const id = input.id || "grp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const newGroup: Group = { ...input, active: input.active !== false, id, createdAt: new Date().toISOString() };
      data.groups.push(newGroup);
      return { data, result: newGroup };
    });
  }
  const data = cloneStoreData(await loadData());
  const id = input.id || "grp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const newGroup: Group = {
    ...input,
    active: input.active !== false,
    id,
    createdAt: new Date().toISOString(),
  };
  data.groups.push(newGroup);
  await persistData(data);
  return newGroup;
}

export async function updateGroup(id: string, patch: Partial<Group>): Promise<Group | null> {
  if (isDbConnected()) return postgresUpdateGroup(id, patch);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const idx = data.groups.findIndex((g) => g.id === id);
      if (idx === -1) return { data, result: null };
      data.groups[idx] = { ...data.groups[idx], ...patch, id };
      return { data, result: data.groups[idx] };
    });
  }

  const data = cloneStoreData(await loadData());
  const idx = data.groups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  data.groups[idx] = { ...data.groups[idx], ...patch, id };
  await persistData(data);
  return data.groups[idx];
}

export async function deleteGroup(id: string): Promise<boolean> {
  if (isDbConnected()) return postgresDeleteGroup(id);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const before = data.groups.length;
      const studentIds = new Set(data.students.filter((student) => student.groupId === id).map((student) => student.id));
      data.groups = data.groups.filter((group) => group.id !== id);
      if (data.groups.length === before) return { data, result: false };
      data.students = data.students.filter((student) => student.groupId !== id);
      data.records = data.records.filter((record) => record.groupId !== id && !studentIds.has(record.studentId));
      return { data, result: true };
    });
  }

  const data = cloneStoreData(await loadData());
  const before = data.groups.length;
  const studentIds = new Set(data.students.filter((s) => s.groupId === id).map((s) => s.id));
  data.groups = data.groups.filter((g) => g.id !== id);
  if (data.groups.length !== before) {
    // PostgreSQL ON DELETE CASCADE handles this in the database. The file/Redis
    // backends need the same cascade explicitly; otherwise deleted groups leave
    // orphaned students and attendance records visible in the admin panel.
    data.students = data.students.filter((s) => s.groupId !== id);
    data.records = data.records.filter(
      (r) => r.groupId !== id && !studentIds.has(r.studentId)
    );
    if (isDbConnected()) {
      try {
        await query("DELETE FROM groups WHERE id = $1", [id]);
      } catch (err) {
        console.error("[attendanceStore] PostgreSQL dan guruhni o'chirishda xato:", err);
        throw new Error("Guruhni markaziy ma'lumotlar bazasidan o'chirib bo'lmadi");
      }
    }
    await persistData(data);
    return true;
  }
  return false;
}

// ──────────────── O'quvchilar (Students) ────────────────
export async function listStudents(filter?: {
  groupId?: string;
  status?: StudentStatus;
  search?: string;
}): Promise<Student[]> {
  const data = await loadData();
  let result = data.students;
  if (filter?.groupId) {
    result = result.filter((s) => s.groupId === filter.groupId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(
      (s) => s.name.toLowerCase().includes(q) || s.phone.includes(q)
    );
  }
  return result;
}

export async function getStudent(id: string): Promise<Student | null> {
  const data = await loadData();
  return data.students.find((s) => s.id === id) ?? null;
}

export async function createStudent(
  input: Omit<Student, "id" | "enrolledAt"> & { id?: string }
): Promise<Student> {
  if (isDbConnected()) return postgresCreateStudent(input);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const id = input.id || "std_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const student: Student = { ...input, id, enrolledAt: new Date().toISOString() };
      data.students.push(student);
      return { data, result: student };
    });
  }
  const data = cloneStoreData(await loadData());
  const id = input.id || "std_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const newStudent: Student = {
    ...input,
    id,
    enrolledAt: new Date().toISOString(),
  };
  data.students.push(newStudent);
  await persistData(data);
  return newStudent;
}

export async function updateStudent(id: string, patch: Partial<Student>): Promise<Student | null> {
  if (isDbConnected()) return postgresUpdateStudent(id, patch);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const idx = data.students.findIndex((student) => student.id === id);
      if (idx === -1) return { data, result: null };
      data.students[idx] = { ...data.students[idx], ...patch, id };
      return { data, result: data.students[idx] };
    });
  }

  const data = cloneStoreData(await loadData());
  const idx = data.students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  data.students[idx] = { ...data.students[idx], ...patch, id };
  await persistData(data);
  return data.students[idx];
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (isDbConnected()) return postgresDeleteStudent(id);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const before = data.students.length;
      data.students = data.students.filter((student) => student.id !== id);
      if (data.students.length === before) return { data, result: false };
      data.records = data.records.filter((record) => record.studentId !== id);
      return { data, result: true };
    });
  }

  const data = cloneStoreData(await loadData());
  const before = data.students.length;
  data.students = data.students.filter((s) => s.id !== id);
  if (data.students.length !== before) {
    // Keep the file/Redis representation consistent with the SQL foreign-key
    // cascade and do not leave attendance rows for a removed student.
    data.records = data.records.filter((r) => r.studentId !== id);
    if (isDbConnected()) {
      try {
        await query("DELETE FROM students WHERE id = $1", [id]);
      } catch (err) {
        console.error("[attendanceStore] PostgreSQL dan o'quvchini o'chirishda xato:", err);
        throw new Error("O'quvchini markaziy ma'lumotlar bazasidan o'chirib bo'lmadi");
      }
    }
    await persistData(data);
    return true;
  }
  return false;
}

// ──────────────── Davomat (Attendance) ────────────────
export async function recordAttendance(
  items: Array<Omit<AttendanceRecord, "id" | "markedAt">>
): Promise<{ savedCount: number }> {
  if (isDbConnected()) return postgresRecordAttendance(items);
  if (!isDbConnected()) {
    return mutateAttendance((data) => {
      const now = new Date().toISOString();
      for (const item of items) {
        const existingIdx = data.records.findIndex((record) => record.groupId === item.groupId && record.studentId === item.studentId && record.date === item.date);
        if (existingIdx !== -1) {
          data.records[existingIdx] = { ...data.records[existingIdx], status: item.status, note: item.note ?? data.records[existingIdx].note, markedBy: item.markedBy || data.records[existingIdx].markedBy, markedAt: now };
        } else {
          data.records.push({ ...item, id: "att_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), markedAt: now });
        }
      }
      return { data, result: { savedCount: items.length } };
    });
  }

  if (items.length === 0) return { savedCount: 0 };
  const data = cloneStoreData(await loadData());
  const now = new Date().toISOString();

  let savedCount = 0;
  for (const item of items) {
    // Agar o'sha kuni o'sha o'quvchiga davomat qo'yilgan bo'lsa — yangilaymiz (idempotent)
    const existingIdx = data.records.findIndex(
      (r) =>
        r.groupId === item.groupId &&
        r.studentId === item.studentId &&
        r.date === item.date
    );

    if (existingIdx !== -1) {
      data.records[existingIdx] = {
        ...data.records[existingIdx],
        status: item.status,
        note: item.note ?? data.records[existingIdx].note,
        markedBy: item.markedBy || data.records[existingIdx].markedBy,
        markedAt: now,
      };
    } else {
      const newRec: AttendanceRecord = {
        ...item,
        id: "att_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        markedAt: now,
      };
      data.records.push(newRec);
    }
    savedCount++;
  }

  await persistData(data);
  return { savedCount };
}

export async function getAttendance(
  groupId: string,
  monthOrDate?: string
): Promise<AttendanceRecord[]> {
  const data = await loadData();
  let result = data.records.filter((r) => r.groupId === groupId);
  if (monthOrDate) {
    result = result.filter((r) => r.date.startsWith(monthOrDate));
  }
  return result;
}

// ──────────────── Moliya va To'lov Hisobi (Billing Calculation) ────────────────
// O'quvchi necha kun uzrli (sababli) kelmagan bo'lsa, o'sha kunlarning pulini
// oylik to'lovdan avtomatik ayirib beradi.
export async function calculateMonthlyBilling(
  groupId: string,
  month: string // "2026-09"
): Promise<StudentMonthlyBilling[]> {
  const data = await loadData();
  const group = data.groups.find((g) => g.id === groupId);
  if (!group) return [];

  const students = data.students.filter((s) => s.groupId === groupId && s.status !== "ketdi");
  const records = data.records.filter((r) => r.groupId === groupId && r.date.startsWith(month));

  const standardLessons = Number.isInteger(group.lessonsPerMonth) && group.lessonsPerMonth > 0
    ? group.lessonsPerMonth
    : 12;
  const baseMonthlyPrice = Number.isFinite(group.monthlyPrice) && group.monthlyPrice > 0
    ? group.monthlyPrice
    : 400000;
  const perLessonPrice = Math.round(baseMonthlyPrice / standardLessons);

  return students.map((std) => {
    const studentRecords = records.filter((r) => r.studentId === std.id);
    const attendedCount = studentRecords.filter((r) => r.status === "keldi").length;
    const excusedCount = studentRecords.filter((r) => r.status === "sababli").length;
    const unexcusedCount = studentRecords.filter((r) => r.status === "kelmadi").length;

    // Uzrli darslar chegirib tashlanadi
    const excusedDeduction = excusedCount * perLessonPrice;
    const finalPayable = Math.max(0, baseMonthlyPrice - excusedDeduction);

    return {
      studentId: std.id,
      studentName: std.name,
      groupId: group.id,
      groupName: group.name,
      month,
      standardLessons,
      attendedCount,
      excusedCount,
      unexcusedCount,
      baseMonthlyPrice,
      perLessonPrice,
      excusedDeduction,
      finalPayable,
    };
  });
}

/** Testlar uchun xotira keshini tozalash */
export function __resetAttendanceCache(): void {
  cache = null;
  mutationChain = Promise.resolve();
}
