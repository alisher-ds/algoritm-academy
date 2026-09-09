// Algoritm Ecosystem — Attendance, Group and Student Store
// Serverless va lokal muhitda qotmasdan, atomic write va xotira keshi bilan ishlaydi.

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { isDbConnected, query, initDatabase } from "./db";
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

function storeFilePath(): string {
  if (process.env.ATTENDANCE_FILE) return process.env.ATTENDANCE_FILE;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "attendance_data.json");
  }
  return path.join(process.cwd(), ".data", "attendance_data.json");
}

async function loadData(): Promise<AttendanceStoreData> {
  if (cache) return cache;

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
        cache = {
          groups: [...INITIAL_GROUPS],
          students: [...INITIAL_STUDENTS],
          records: [],
        };
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
    }
  }

  // 1. Fayl tizimi (lokal/test fallback)
  const file = storeFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.groups) && Array.isArray(parsed.students)) {
      cache = {
        groups: parsed.groups,
        students: parsed.students,
        records: Array.isArray(parsed.records) ? parsed.records : [],
      };
      return cache;
    }
  } catch {
    // Fayl yo'q yoki boshlang'ich holat
  }

  cache = {
    groups: INITIAL_GROUPS,
    students: INITIAL_STUDENTS,
    records: [],
  };
  await persistData(cache);
  return cache;
}

async function persistData(data: AttendanceStoreData): Promise<void> {
  // 0. PostgreSQL (agar sozlangan bo'lsa)
  if (isDbConnected()) {
    try {
      await initDatabase();
      for (const g of data.groups) {
        await query(
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
        await query(
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
        await query(
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
    } catch (err) {
      console.error("[attendanceStore] PostgreSQL ga saqlashda xato:", err);
    }
  }

  // 1. Fayl tizimiga yozish
  const file = storeFilePath();
  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
        const tmp = file + "." + process.pid + "." + Date.now() + ".tmp";
        await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
        await fs.rename(tmp, file);
      } catch (err) {
        console.warn("[attendanceStore] Diskka yozishda ogohlantirish (kesh xotirada saqlandi):", err);
      }
      cache = data;
    });
  await writeChain;
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
  const data = await loadData();
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
  const data = await loadData();
  const idx = data.groups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  data.groups[idx] = { ...data.groups[idx], ...patch, id };
  await persistData(data);
  return data.groups[idx];
}

export async function deleteGroup(id: string): Promise<boolean> {
  const data = await loadData();
  const before = data.groups.length;
  data.groups = data.groups.filter((g) => g.id !== id);
  if (data.groups.length !== before) {
    if (isDbConnected()) {
      await query("DELETE FROM groups WHERE id = $1", [id]).catch((err) => {
        console.error("[attendanceStore] PostgreSQL dan guruhni o'chirishda xato:", err);
      });
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
  const data = await loadData();
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
  const data = await loadData();
  const idx = data.students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  data.students[idx] = { ...data.students[idx], ...patch, id };
  await persistData(data);
  return data.students[idx];
}

export async function deleteStudent(id: string): Promise<boolean> {
  const data = await loadData();
  const before = data.students.length;
  data.students = data.students.filter((s) => s.id !== id);
  if (data.students.length !== before) {
    if (isDbConnected()) {
      await query("DELETE FROM students WHERE id = $1", [id]).catch((err) => {
        console.error("[attendanceStore] PostgreSQL dan o'quvchini o'chirishda xato:", err);
      });
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
  if (items.length === 0) return { savedCount: 0 };
  const data = await loadData();
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

  const standardLessons = group.lessonsPerMonth || 12;
  const baseMonthlyPrice = group.monthlyPrice || 400000;
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
}
