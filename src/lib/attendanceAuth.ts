// Algoritm Ecosystem — Attendance, Groups & Students RBAC Authorization
// Har bir so'rovni tekshirish: Administrator yoki tegishli Ustoz ekanligini tasdiqlash.

import { isAuthed } from "@/lib/adminAuth";
import { getAuthenticatedTeacher, type Teacher } from "@/lib/teacherAuth";
import { getGroup } from "@/lib/attendanceStore";
import type { Group } from "@/lib/attendanceTypes";

export interface AttendanceAuthContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  teacher: Teacher | null;
}

/**
 * So'rov yuborgan foydalanuvchining autentifikatsiyasini aniqlaydi.
 * Admin (algoritm_admin cookie) yoki Ustoz (token / cookie) ekanligini tekshiradi.
 */
export async function getAttendanceAuthContext(req: Request): Promise<AttendanceAuthContext> {
  // 1. Admin tekshiruvi
  if (isAuthed(req)) {
    return { isAuthenticated: true, isAdmin: true, teacher: null };
  }

  // 2. Ustoz tekshiruvi (Bearer token yoki cookie orqali)
  const teacher = await getAuthenticatedTeacher(req);
  if (teacher) {
    return { isAuthenticated: true, isAdmin: false, teacher };
  }

  // 3. Autentifikatsiyadan o'tmagan
  return { isAuthenticated: false, isAdmin: false, teacher: null };
}

/**
 * Ustozning berilgan guruhga kirish yoki boshqarish huquqi borligini tekshiradi.
 * Admin uchun doimo ruxsat beriladi.
 */
export function canAccessGroup(
  auth: AttendanceAuthContext,
  group: Group | null | undefined
): boolean {
  if (!auth.isAuthenticated) return false;
  if (auth.isAdmin) return true;
  if (!auth.teacher || !group) return false;

  // Agar ustozning holati faol bo'lmasa (pending yoki blocked), ruxsat yo'q
  if (auth.teacher.status && auth.teacher.status !== "active") {
    return false;
  }

  if (group.teacherId) {
    return group.teacherId === auth.teacher.id;
  }

  // Legacy records without teacherId may still use the old name binding. Never
  // use the name fallback when a different immutable teacherId is present;
  // otherwise deleting an account and recreating the same name could restore
  // access to its old groups.
  return Boolean(
    group.teacherName &&
      auth.teacher.name &&
      group.teacherName.trim().toLowerCase() === auth.teacher.name.trim().toLowerCase()
  );

  return false;
}

/**
 * Guruh ID si orqali ushbu foydalanuvchi guruhga ega ekanligini tasdiqlaydi.
 */
export async function canAccessGroupId(
  auth: AttendanceAuthContext,
  groupId: string
): Promise<boolean> {
  if (!auth.isAuthenticated) return false;
  if (auth.isAdmin) return true;
  if (!groupId) return false;

  const group = await getGroup(groupId);
  return canAccessGroup(auth, group);
}
