"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Script from "next/script";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  UserPlus,
  Save,
  Loader2,
  Check,
  Phone,
  Sparkles,
  LogOut,
  KeyRound,
  WifiOff,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Send,
} from "lucide-react";
import {
  type Group,
  type Student,
  type AttendanceStatus,
  isLessonToday,
} from "@/lib/attendanceTypes";
import type { Teacher } from "@/lib/teacherAuth";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready?: () => void;
  expand?: () => void;
  HapticFeedback?: {
    impactOccurred?: (style: string) => void;
    selectionChanged?: () => void;
    notificationOccurred?: (type: string) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("algoritm_teacher_token") : null;
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}

const OFFLINE_QUEUE_MAX_ATTEMPTS = 10;
const OFFLINE_QUEUE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export default function DavomatTeacherPage() {
  // ─── 1. Autentifikatsiya va Ustoz Holati ───
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  // Login formasi holati
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Yangi hisob yaratish / Ro'yxatdan o'tish holati
  const [regName, setRegName] = useState("");
  const [regSubject, setRegSubject] = useState("");
  const [regPhone, setRegPhone] = useState("+998 ");
  const [regLogin, setRegLogin] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // ─── 2. Guruhlar va Davomat Holati ───
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  // UX va Tarmoq
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Yangi o'quvchi qo'shish modali
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("+998 ");
  const [addingStudent, setAddingStudent] = useState(false);

  // Yangi guruh ochish modali
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDays, setNewGroupDays] = useState("dush-chor-juma");
  const [newGroupTime, setNewGroupTime] = useState("14:00 - 15:30");
  const [newGroupRoom, setNewGroupRoom] = useState("201-xona");
  const [newGroupPrice, setNewGroupPrice] = useState("450000");
  const [addingGroup, setAddingGroup] = useState(false);

  // Bugungi sana
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const todayFormattedUz = useMemo(() => {
    return new Date().toLocaleDateString("uz-UZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // ─── 3. Tarmoq va Oflayn Navbat Listeneri ───
  const syncOfflineQueue = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const rawQueue = localStorage.getItem("algoritm_offline_queue");
      if (!rawQueue) return;
      const queue: Array<{ records: Array<Record<string, unknown>>; attempts?: number; nextAttemptAt?: number; createdAt?: number }> = JSON.parse(rawQueue);
      if (queue.length === 0) return;

      const remaining: typeof queue = [];
      const now = Date.now();
      for (const item of queue) {
        const attempts = Number.isInteger(item.attempts) && item.attempts! >= 0 ? item.attempts! : 0;
        const createdAt = typeof item.createdAt === "number" ? item.createdAt : now;
        if (!Array.isArray(item.records) || item.records.length === 0 || attempts >= OFFLINE_QUEUE_MAX_ATTEMPTS || now - createdAt > OFFLINE_QUEUE_MAX_AGE_MS) {
          continue;
        }
        if (item.nextAttemptAt && item.nextAttemptAt > now) {
          remaining.push(item);
          continue;
        }
        try {
          const res = await authFetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records: item.records }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.success) continue;
          // Validation, permission and expired-session errors cannot become
          // valid by retrying forever. Temporary outages and rate limits can.
          if (res.status >= 400 && res.status < 500 && res.status !== 429) continue;
          const nextAttempts = attempts + 1;
          if (nextAttempts < OFFLINE_QUEUE_MAX_ATTEMPTS) {
            remaining.push({ ...item, attempts: nextAttempts, createdAt, nextAttemptAt: Date.now() + 30_000 });
          }
          if (res.status >= 500 || res.status === 429) break;
        } catch {
          const nextAttempts = attempts + 1;
          if (nextAttempts < OFFLINE_QUEUE_MAX_ATTEMPTS) {
            remaining.push({ ...item, attempts: nextAttempts, createdAt, nextAttemptAt: Date.now() + 30_000 });
          }
          break;
        }
      }
      if (remaining.length > 0) localStorage.setItem("algoritm_offline_queue", JSON.stringify(remaining));
      else localStorage.removeItem("algoritm_offline_queue");
    } catch {
      // Corrupted local data is left untouched so it can be recovered manually.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => {
      setIsOnline(true);
      void syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    void syncOfflineQueue();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncOfflineQueue]);

  // ─── 4. Sessiya va Ustoz Ma'lumotlarini Tekshirish ───
  const checkSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await authFetch("/api/teachers/auth");
      const data = await res.json();

      if (data.isPending) {
        setCurrentTeacher(data.teacher);
        setPendingNotice(data.message || "Hisobingiz administrator tomonidan ko'rib chiqilmoqda. Tasdiqlangach darslaringiz ochiladi.");
        setGroups([]);
        return;
      }

      if (data.success && data.authenticated && data.teacher) {
        setCurrentTeacher(data.teacher);
        if (typeof window !== "undefined") {
          localStorage.setItem("algoritm_teacher_profile", JSON.stringify(data.teacher));
        }
        const sortedGroups = (data.groups || []).sort((a: Group, b: Group) => {
          const aToday = isLessonToday(a.days);
          const bToday = isLessonToday(b.days);
          if (aToday && !bToday) return -1;
          if (!aToday && bToday) return 1;
          return 0;
        });

        setGroups(sortedGroups);
        if (sortedGroups.length > 0) {
          setSelectedGroupId((prev) => (prev && sortedGroups.some((g: Group) => g.id === prev) ? prev : sortedGroups[0].id));
        }
      } else {
        if (res.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("algoritm_teacher_token");
          localStorage.removeItem("algoritm_teacher_profile");
        }
        setCurrentTeacher(null);
      }
    } catch {
      // Tarmoq uzilsa saqlangan profildan tiklaymiz
      if (typeof window !== "undefined") {
        try {
          const cachedProfile = localStorage.getItem("algoritm_teacher_profile");
          if (cachedProfile) {
            setCurrentTeacher(JSON.parse(cachedProfile));
          }
        } catch {}
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Telegram WebApp muhitini tekshirish
  useEffect(() => {
    let ignore = false;
    const initTgAndSession = async () => {
      if (typeof window === "undefined") return;
      const tg = window.Telegram?.WebApp;
      if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
        try {
          tg.ready?.();
          tg.expand?.();
        } catch {}
        const user = tg.initDataUnsafe?.user || null;
        if (tg.initData) {
          try {
            const r = await fetch("/api/teachers/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "telegram-auth", initData: tg.initData }),
            });
            const data = await r.json();
            if (ignore) return;
            setIsTelegram(true);
            if (user) setTelegramUser(user);
            if (data.success && data.token) {
              localStorage.setItem("algoritm_teacher_token", data.token);
              if (data.teacher) {
                localStorage.setItem("algoritm_teacher_profile", JSON.stringify(data.teacher));
                setCurrentTeacher(data.teacher);
              }
            }
            await checkSession();
            return;
          } catch {
            if (ignore) return;
            setIsTelegram(true);
            if (user) setTelegramUser(user);
            await checkSession();
            return;
          }
        }
        if (ignore) return;
        setIsTelegram(true);
        if (user) setTelegramUser(user);
      } else {
        if (ignore) return;
        setIsTelegram(false);
      }
      await checkSession();
    };
    void initTgAndSession();
    return () => {
      ignore = true;
    };
  }, [checkSession]);

  // ─── 5. Guruh Tanlanganda O'quvchilar va Davomatni Yuklash ───
  const reloadGroupData = useCallback(
    async (groupId: string) => {
      try {
        const [studRes, attRes] = await Promise.all([
          authFetch(`/api/students?groupId=${groupId}`),
          authFetch(`/api/attendance?groupId=${groupId}&date=${todayStr}`),
        ]);
        const studData = await studRes.json();
        const attData = await attRes.json();

        const studentList: Student[] = studData.success && Array.isArray(studData.students) ? studData.students : [];
        setStudents(studentList);

        const initialStatus: Record<string, AttendanceStatus> = {};
        const initialNotes: Record<string, string> = {};

        if (attData.success && Array.isArray(attData.records) && attData.records.length > 0) {
          attData.records.forEach((r: { studentId: string; status: AttendanceStatus; note?: string }) => {
            initialStatus[r.studentId] = r.status;
            if (r.note) initialNotes[r.studentId] = r.note;
          });
        } else {
          // Keshda saqlangan qoralama bormi?
          try {
            const draft = localStorage.getItem(`draft_att_${groupId}_${todayStr}`);
            if (draft) {
              const records = JSON.parse(draft);
              records.forEach((r: { studentId: string; status: AttendanceStatus; note?: string }) => {
                initialStatus[r.studentId] = r.status;
                if (r.note) initialNotes[r.studentId] = r.note;
              });
            } else {
              studentList.forEach((s) => {
                initialStatus[s.id] = "keldi";
              });
            }
          } catch {
            studentList.forEach((s) => {
              initialStatus[s.id] = "keldi";
            });
          }
        }

        setAttendance(initialStatus);
        setNotes(initialNotes);
        setErrorNotice(null);
      } catch {
        setErrorNotice("Guruh ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoadingGroup(false);
      }
    },
    [todayStr]
  );

  useEffect(() => {
    if (!selectedGroupId || !currentTeacher) return;
    let ignore = false;
    const loadData = async () => {
      try {
        const [studRes, attRes] = await Promise.all([
          authFetch(`/api/students?groupId=${selectedGroupId}`),
          authFetch(`/api/attendance?groupId=${selectedGroupId}&date=${todayStr}`),
        ]);
        const studData = await studRes.json();
        const attData = await attRes.json();
        if (ignore) return;

        const studentList: Student[] = studData.success && Array.isArray(studData.students) ? studData.students : [];
        setStudents(studentList);

        const initialStatus: Record<string, AttendanceStatus> = {};
        const initialNotes: Record<string, string> = {};

        if (attData.success && Array.isArray(attData.records) && attData.records.length > 0) {
          attData.records.forEach((r: { studentId: string; status: AttendanceStatus; note?: string }) => {
            initialStatus[r.studentId] = r.status;
            if (r.note) initialNotes[r.studentId] = r.note;
          });
        } else {
          try {
            const draft = localStorage.getItem(`draft_att_${selectedGroupId}_${todayStr}`);
            if (draft) {
              const records = JSON.parse(draft);
              records.forEach((r: { studentId: string; status: AttendanceStatus; note?: string }) => {
                initialStatus[r.studentId] = r.status;
                if (r.note) initialNotes[r.studentId] = r.note;
              });
            } else {
              studentList.forEach((s) => {
                initialStatus[s.id] = "keldi";
              });
            }
          } catch {
            studentList.forEach((s) => {
              initialStatus[s.id] = "keldi";
            });
          }
        }

        setAttendance(initialStatus);
        setNotes(initialNotes);
        setErrorNotice(null);
      } catch {
        if (!ignore) setErrorNotice("Guruh ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        if (!ignore) setLoadingGroup(false);
      }
    };
    void loadData();
    return () => {
      ignore = true;
    };
  }, [selectedGroupId, currentTeacher, todayStr]);

  // ─── 6. Autentifikatsiya Amallari (Login, Parol o'rnatish, Chiqish) ───

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !passwordInput) {
      setAuthError("Login va parolni kiriting");
      return;
    }
    setAuthSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          login: loginInput.trim(),
          password: passwordInput,
          telegramInitData: window.Telegram?.WebApp?.initData || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("algoritm_teacher_token", data.token);
        }
        if (data.teacher && typeof window !== "undefined") {
          localStorage.setItem("algoritm_teacher_profile", JSON.stringify(data.teacher));
          setCurrentTeacher(data.teacher);
        }
        setPasswordInput("");
        await checkSession();
      } else {
        if (data.pending) {
          setAuthError("⏳ Hisobingiz ma'muriyat tomonidan ko'rib chiqilmoqda. Administrator tasdiqlaganidan so'ng darslaringiz ochiladi.");
        } else {
          setAuthError(data.error || "Login yoki parol noto'g'ri");
        }
      }
    } catch {
      setAuthError("Serverga ulanishda xatolik");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regSubject.trim() || !regLogin.trim() || !regPassword) {
      setAuthError("Iltimos, barcha maydonlarni to'ldiring: Ism-familiya, fan, login va parol.");
      return;
    }
    if (regPassword.length < 4) {
      setAuthError("Parol kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError("Kiritilgan parollar bir-biriga mos kelmadi");
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: regName.trim(),
          subject: regSubject.trim(),
          phone: regPhone.trim(),
          login: regLogin.trim(),
          password: regPassword,
          confirmPassword: regConfirmPassword,
          telegramInitData: window.Telegram?.WebApp?.initData || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.isPending) {
          setRegName("");
          setRegSubject("");
          setRegLogin("");
          setRegPassword("");
          setRegConfirmPassword("");
          setAuthTab("login");
          setPendingNotice("✅ Ro'yxatdan o'tish arizangiz qabul qilindi! Administrator tasdiqlaganidan so'ng shaxsiy kabinetingiz ochiladi.");
          return;
        }
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("algoritm_teacher_token", data.token);
        }
        if (data.teacher && typeof window !== "undefined") {
          localStorage.setItem("algoritm_teacher_profile", JSON.stringify(data.teacher));
          setCurrentTeacher(data.teacher);
        }
        setRegName("");
        setRegSubject("");
        setRegLogin("");
        setRegPassword("");
        setRegConfirmPassword("");
        await checkSession();
      } else {
        setAuthError(data.error || "Ro'yxatdan o'tishda xatolik");
      }
    } catch {
      setAuthError("Serverga ulanishda xatolik");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentTeacher) return;
    setAddingGroup(true);
    try {
      const res = await authFetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          subject: currentTeacher.subject || "Matematika",
          teacherId: currentTeacher.id,
          teacherName: currentTeacher.name,
          days: newGroupDays,
          time: newGroupTime,
          room: newGroupRoom,
          monthlyPrice: Number(newGroupPrice) || 450000,
          lessonsPerMonth: 12,
          active: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.group) {
        setGroups((prev) => [...prev, data.group]);
        setSelectedGroupId(data.group.id);
        setShowAddGroupModal(false);
        setNewGroupName("");
      }
    } catch {
      setErrorNotice("Guruhni yaratishda xatolik yuz berdi");
    } finally {
      setAddingGroup(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("algoritm_teacher_token");
      }
      await authFetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    setCurrentTeacher(null);
    setGroups([]);
    setStudents([]);
    await checkSession();
  };

  // ─── 7. Davomat Amallari ───

  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = "keldi";
    });
    setAttendance(updated);
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    } catch {}
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    try {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    } catch {}
  };

  const handleSaveAttendance = async () => {
    if (!selectedGroupId || students.length === 0 || !currentTeacher) return;
    setSaving(true);
    setSaveSuccess(false);
    setIsOfflineSaved(false);
    setErrorNotice(null);

    const records = students.map((s) => ({
      groupId: selectedGroupId,
      studentId: s.id,
      date: todayStr,
      status: attendance[s.id] || "keldi",
      note: notes[s.id] || undefined,
      markedBy: currentTeacher.name,
    }));

    // Lokal qoralama
    try {
      localStorage.setItem(`draft_att_${selectedGroupId}_${todayStr}`, JSON.stringify(records));
    } catch {}

    const rawInitData = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData : undefined;

    let queueForRetry = false;
    try {
      const res = await authFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, initData: rawInitData }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSaveSuccess(true);
        try {
          localStorage.removeItem(`draft_att_${selectedGroupId}_${todayStr}`);
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
        } catch {}
        setTimeout(() => setSaveSuccess(false), 3500);
      } else if (res.status >= 500 || res.status === 429) {
        queueForRetry = true;
        setErrorNotice(data.error || "Server vaqtincha ishlamayapti");
      } else {
        // Validation/auth errors are not offline errors and must not be queued.
        setErrorNotice(data.error || "Davomatni saqlab bo'lmadi");
      }
    } catch {
      queueForRetry = true;
    }

    if (queueForRetry) {
      try {
        const rawQueue = localStorage.getItem("algoritm_offline_queue") || "[]";
        const parsed: Array<{ records: typeof records; attempts?: number; nextAttemptAt?: number; createdAt?: number }> = JSON.parse(rawQueue);
        const queuedIndex = parsed.findIndex((item) =>
          item.records?.[0]?.groupId === selectedGroupId && item.records?.[0]?.date === todayStr
        );
        if (queuedIndex === -1) {
          parsed.push({ records, createdAt: Date.now() });
        } else {
          // Keep the latest user edits instead of retrying an older draft.
          parsed[queuedIndex] = { records, attempts: 0, nextAttemptAt: undefined, createdAt: Date.now() };
        }
        localStorage.setItem("algoritm_offline_queue", JSON.stringify(parsed));
        setIsOfflineSaved(true);
        setTimeout(() => setIsOfflineSaved(false), 5000);
      } catch {
        setErrorNotice("Davomatni saqlab bo'lmadi. Internet aloqasini tekshiring.");
      }
    }

    if (queueForRetry && !isOnline) {
      setErrorNotice("Internet yo'q — davomat qurilmada saqlandi va aloqa tiklanganda yuboriladi.");
    }
    setSaving(false);
  };

  // Yangi o'quvchi qo'shish
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedGroupId) return;
    setAddingStudent(true);
    try {
      const res = await authFetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim(),
          groupId: selectedGroupId,
          status: "faol",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewStudentName("");
        setNewStudentPhone("+998 ");
        void reloadGroupData(selectedGroupId);
      } else {
        alert(data.error || "O'quvchini qo'shib bo'lmadi");
      }
    } catch {
      alert("Serverga ulanishda xatolik");
    } finally {
      setAddingStudent(false);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  // ═════════════════════════════════════════════════════════════════════════
  // EKRAN 1: YUKLANISH HOLATI
  // ═════════════════════════════════════════════════════════════════════════
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Ustoz kabineti yuklanmoqda...</p>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // EKRAN 2: AVTORIZATSIYA VA PAROL YARATISH (KIRMAGAN BO'LSA)
  // ═════════════════════════════════════════════════════════════════════════
  if (!currentTeacher) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Logo va Sarlavha */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center mx-auto text-slate-950 shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">Algoritm Ustoz Portali</h2>
            <p className="text-xs text-slate-400">
              Har bir ustoz uchun alohida shaxsiy kabinet va mustaqil guruhlar
            </p>
          </div>

          {/* Tab Tanlash (Kirish vs Parol O'rnatish) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-white/5 text-xs font-bold">
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthError("");
              }}
              className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authTab === "login"
                  ? "bg-brand-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Tizimga Kirish</span>
            </button>
            <button
              onClick={() => {
                setAuthTab("register");
                setAuthError("");
              }}
              className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authTab === "register"
                  ? "bg-brand-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Ro'yxatdan O'tish</span>
            </button>
          </div>

          {pendingNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{pendingNotice}</div>
            </div>
          )}

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{authError}</div>
            </div>
          )}

          {Boolean(isTelegram || telegramUser) && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2.5">
              <Send className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="text-[11px] leading-relaxed">
                Telegram: <b>@{telegramUser?.username || telegramUser?.first_name || "ustoz"}</b>.
                Kirishingiz yoki ro'yxatdan o'tishingiz bilan profilingiz Telegram bilan avtomatik bog'lanadi.
              </div>
            </div>
          )}

          {/* TAB 1: KIRISH FORMASI */}
          {authTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ustoz Logini yoki Telefoni
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: aziz yoki +998901234501"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Shaxsiy Parol
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition cursor-pointer"
              >
                {authSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Kabinetga Kirish</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: YANGI USTOZ RO'YXATDAN O'TISHI (ISM-FAMILIYA QO'LDA KIRITILADI) */}
          {authTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-300">
                ✍️ <b>Yangi ustoz hisobi:</b> Ism-familiyangiz, faningiz va shaxsiy ma'lumotlaringizni to'liq kiriting. Hech kim sizning hisobingizga ruxsatsiz kira olmaydi.
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Ism va Familiyangiz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Aziz Xolmurodov"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Fan / Mutaxassislik *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="masalan: SAT Matematika"
                    value={regSubject}
                    onChange={(e) => setRegSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Telefon Raqami *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Shaxsiy Login * (Lotin harflarida)
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: aziz_sat yoki azizx"
                  value={regLogin}
                  onChange={(e) => setRegLogin(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Shaxsiy Parol *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Kamida 4 ta belgi"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Parolni Qayta Kiriting *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Tasdiqlash"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer mt-2"
              >
                {authSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Ro'yxatdan O'tish va Kirish</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Telegram Bot havolasi */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Algoritm Academy & School</span>
            <a
              href="https://t.me/algoritm_ustoz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>@algoritm_ustoz_bot</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // EKRAN 2.5: TASDIQLANMAGAN (PENDING YOKI BLOCKED) USTOZ XABARNOMASI
  // ═════════════════════════════════════════════════════════════════════════
  if (currentTeacher && (currentTeacher.status === "pending" || currentTeacher.status === "blocked")) {
    const isBlocked = currentTeacher.status === "blocked";
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
              isBlocked
                ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-rose-500/10"
                : "bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-amber-500/10"
            }`}
          >
            {isBlocked ? <XCircle className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-pulse" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {isBlocked ? "Hisobingiz Cheklangan" : "Arizangiz Ko'rib Chiqilmoqda"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBlocked
                ? "Sizning o'qituvchi hisobingiz administrator tomonidan vaqtincha to'xtatilgan. Ma'lumot olish uchun markaz ma'muriyatiga murojaat qiling."
                : (pendingNotice || `Hurmatli ${currentTeacher.name}, sizning ro'yxatdan o'tish arizangiz markaz ma'muriyatiga yuborildi. Administrator tasdiqlagach, shaxsiy kabinetingiz va guruhlaringiz faollashadi.`)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Ustoz:</span>
              <span className="font-semibold text-white">{currentTeacher.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Mutaxassislik:</span>
              <span className="font-semibold text-brand-400">{currentTeacher.subject}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Login:</span>
              <span className="font-mono text-slate-300">@{currentTeacher.login}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Holat:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                  isBlocked
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {isBlocked ? "Bloklangan" : "Kutilmoqda"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            {!isBlocked && (
              <button
                type="button"
                onClick={() => void checkSession()}
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition cursor-pointer"
              >
                <span>Holatni Qayta Tekshirish</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // EKRAN 3: USTOZNING SHAXSIY KABINETI (FAZOLAR VA FAQAT O'Z GURUHLARI)
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      {/* Oflayn ogohlantirish */}
      {!isOnline && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 sticky top-0 z-40">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Internet yo'q. Oflayn rejim faol — davomat qurilmada xavfsiz saqlanadi.</span>
        </div>
      )}

      {/* Xatolik ogohlantirishi */}
      {errorNotice && (
        <div className="bg-rose-500/90 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-1.5 sticky top-0 z-40">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ─── Shaxsiy Ustoz Navbari ─── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
              {currentTeacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white leading-tight">{currentTeacher.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Ustoz
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-slate-500" />
                <span>{currentTeacher.subject}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Kabinetdan chiqish"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Bugungi sana va hisobot ko'rsatkichi */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Calendar className="w-4 h-4 text-brand-400" />
            <span className="capitalize">{todayFormattedUz}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Guruhlarim:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-white/5">
              {groups.length} ta
            </span>
          </div>
        </div>

        {/* ─── Ustozning Faol Guruhlarni Tanlash Lentalari ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Mening Guruhlarim ({groups.length})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 hidden sm:inline">Bugungi darslar birinchi o'rinda</span>
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="py-1 px-2.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>+ Yangi Guruh</span>
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-300 font-bold">Hozircha guruhlaringiz yo'q</p>
              <p className="text-[11px] text-slate-500">O'quvchilaringiz bilan darsni boshlash uchun birinchi guruhingizni oching:</p>
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="py-2.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-lg shadow-brand-500/20"
              >
                <span>➕ Birinchi Guruhingizni Ochish</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {groups.map((group) => {
                const isSelected = group.id === selectedGroupId;
                const isToday = isLessonToday(group.days);

                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`shrink-0 p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-w-[170px] ${
                      isSelected
                        ? "bg-brand-500/15 border-brand-500/50 shadow-lg shadow-brand-500/10 text-white"
                        : "bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold truncate max-w-[130px]">{group.name}</span>
                      {isToday && (
                        <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Bugun
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <span>{group.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" />
                        <span>{group.room}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Tanlangan Guruh Boshqaruvi ─── */}
        {selectedGroup && (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            {/* Guruh Ma'lumotlari Paneli */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h2 className="text-base font-extrabold text-white">{selectedGroup.name}</h2>
                <p className="text-xs text-brand-400 font-semibold">{selectedGroup.subject}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-brand-400" />
                  <span>O'quvchi qo'shish</span>
                </button>

                <button
                  onClick={markAllPresent}
                  className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Barchasi keldi</span>
                </button>
              </div>
            </div>

            {/* O'quvchilar Ro'yxati */}
            {loadingGroup ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                <span>O'quvchilar ro'yxati yuklanmoqda...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Ushbu guruhda o'quvchilar mavjud emas. Yuqoridagi "+ O'quvchi qo'shish" tugmasi orqali kiriting.
              </div>
            ) : (
              <div className="space-y-2.5">
                {students.map((student, idx) => {
                  const status = attendance[student.id] || "keldi";

                  return (
                    <div
                      key={student.id}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-white/15"
                    >
                      {/* O'quvchi ismi va telefon */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500 w-5 text-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{student.name}</div>
                          {student.phone && (
                            <a
                              href={`tel:${student.phone}`}
                              className="text-[10px] text-slate-400 hover:text-brand-400 flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{student.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* 3 ta Katta Status Tugmalari */}
                      <div className="grid grid-cols-3 gap-1.5 sm:w-auto w-full">
                        <button
                          onClick={() => setStudentStatus(student.id, "keldi")}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                            status === "keldi"
                              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                              : "bg-white/5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Keldi</span>
                        </button>

                        <button
                          onClick={() => setStudentStatus(student.id, "sababli")}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                            status === "sababli"
                              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                              : "bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Sababli</span>
                        </button>

                        <button
                          onClick={() => setStudentStatus(student.id, "kelmadi")}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                            status === "kelmadi"
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                              : "bg-white/5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Kelmadi</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Pastki Qotirilgan Davomatni Saqlash Paneli ─── */}
      {selectedGroup && students.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-white/10 p-3 sm:p-4 backdrop-blur-lg z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="text-xs space-y-0.5">
              <div className="text-slate-400 font-medium">Jami {students.length} ta o'quvchi</div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-emerald-400">
                  {Object.values(attendance).filter((s) => s === "keldi").length} Keldi
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400">
                  {Object.values(attendance).filter((s) => s === "sababli").length} Sababli
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-rose-400">
                  {Object.values(attendance).filter((s) => s === "kelmadi").length} Kelmadi
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Saqlandi!</span>
                </>
              ) : isOfflineSaved ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Oflayn saqlandi</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Davomatni Saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Yangi O'quvchi Qo'shish Modali ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white">Yangi o'quvchi qo'shish</h3>
            <p className="text-xs text-slate-400">
              Guruh: <b>{selectedGroup?.name}</b>
            </p>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  O'quvchi Ism Familiyasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: Alisher Navoiy"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  {addingStudent ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Yangi Guruh Ochish Modali ─── */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white">Yangi guruh ochish</h3>
            <p className="text-xs text-slate-400">
              Ustoz: <b>{currentTeacher.name}</b> ({currentTeacher.subject})
            </p>

            <form onSubmit={handleAddGroup} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Guruh Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="masalan: SAT Intensive 1-Guruh"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Dars Kunlari
                  </label>
                  <select
                    value={newGroupDays}
                    onChange={(e) => setNewGroupDays(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="dush-chor-juma">Dush-Chor-Juma</option>
                    <option value="sesh-pay-shanba">Sesh-Pay-Shanba</option>
                    <option value="har-kuni">Har kuni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Dars Vaqti
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="14:00 - 15:30"
                    value={newGroupTime}
                    onChange={(e) => setNewGroupTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Xona / Bino
                  </label>
                  <input
                    type="text"
                    placeholder="201-xona"
                    value={newGroupRoom}
                    onChange={(e) => setNewGroupRoom(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Oylik To'lov (so'm)
                  </label>
                  <input
                    type="number"
                    value={newGroupPrice}
                    onChange={(e) => setNewGroupPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={addingGroup}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  {addingGroup ? "Yaratilmoqda..." : "Guruhni Ochish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
