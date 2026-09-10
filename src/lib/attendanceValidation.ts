import { cleanText } from "./sanitize";
import { normalizeUzPhone } from "./phone";
import type { AttendanceStatus, DaySchedule, StudentStatus } from "./attendanceTypes";

export const DAY_SCHEDULES: DaySchedule[] = [
  "dush-chor-juma",
  "sesh-pay-shanba",
  "har-kuni",
  "dam-olish",
];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["keldi", "kelmadi", "sababli"];
export const STUDENT_STATUSES: StudentStatus[] = ["faol", "ketdi", "muzlatilgan"];

export function text(value: unknown, max: number): string {
  return cleanText(value, max);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidMonth(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  return true;
}

export function normalizeRequiredPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return normalizeUzPhone(value);
}

export function isPositiveMoney(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 100_000_000;
}

export function isPositiveInteger(value: unknown, max = 60): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= max;
}

export function isStatus(value: unknown): value is StudentStatus {
  return typeof value === "string" && STUDENT_STATUSES.includes(value as StudentStatus);
}

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return typeof value === "string" && ATTENDANCE_STATUSES.includes(value as AttendanceStatus);
}

export function isDaySchedule(value: unknown): value is DaySchedule {
  return typeof value === "string" && DAY_SCHEDULES.includes(value as DaySchedule);
}
