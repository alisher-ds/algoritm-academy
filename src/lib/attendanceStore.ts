// Algoritm Ecosystem — Attendance, Group and Student Store
// Serverless va lokal muhitda qotmasdan, atomic write va xotira keshi bilan ishlaydi.

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type {
  Group,
  Student,
  AttendanceRecord,
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
