export type DaySchedule = "dush-chor-juma" | "sesh-pay-shanba" | "har-kuni" | "dam-olish";

export type AttendanceStatus = "keldi" | "kelmadi" | "sababli";

export type StudentStatus = "faol" | "ketdi" | "muzlatilgan";

export interface Group {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  days: DaySchedule;
  time: string; // Masalan "14:00 - 15:30"
  room: string; // Masalan "204-xona"
  monthlyPrice: number; // Masalan 450000 so'm
  lessonsPerMonth: number; // Standart 12 ta dars
  active: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  groupId: string;
  enrolledAt: string;
  status: StudentStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  groupId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string; // Masalan "Shifokor ma'lumotnomasi"
  markedBy: string; // Ustoz ismi yoki "admin"
  markedAt: string; // ISO sana
}

export interface StudentMonthlyBilling {
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  month: string; // YYYY-MM
  standardLessons: number; // 12
  attendedCount: number; // Masalan 8
  excusedCount: number; // Masalan 4 (sababli)
  unexcusedCount: number; // Masalan 0
  baseMonthlyPrice: number; // 400 000
  perLessonPrice: number; // 33 333
  excusedDeduction: number; // 4 * 33 333 = 133 332
  finalPayable: number; // 400 000 - 133 332 = 266 668
}
