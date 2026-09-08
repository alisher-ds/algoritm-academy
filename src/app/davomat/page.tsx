"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  UserPlus,
  ArrowLeft,
  Save,
  Loader2,
  Check,
  UserX,
  Phone,
  Sparkles,
  RefreshCw,
  Lock,
  Send,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import type {
  Group,
  Student,
  AttendanceStatus,
  AttendanceRecord,
} from "@/lib/attendanceTypes";

const TEACHERS = [
  { id: "tm-aziz", name: "Aziz Xolmurodov", subject: "Matematika & SAT Math" },
  { id: "tm-jasur", name: "Jasur Jovliyev", subject: "Ingliz Tili · IELTS" },
  { id: "tm-oxunjon", name: "Oxunjon Ozodov", subject: "Digital SAT" },
  { id: "tm-adham", name: "Adham Sohibov", subject: "Prezident Maktabi & Mantiq" },
  { id: "tm-shohista", name: "Shohista Jalilovna", subject: "Boshlang'ich Rus Sinf" },
  { id: "tm-bobur", name: "Bobur Xaydarov", subject: "Asoschi & SAT Math" },
];

export default function DavomatTeacherPage() {
  // Telegram WebApp va Xavfsizlik Holati
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [pinAuth, setPinAuth] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [teacherList, setTeacherList] = useState<{ id: string; name: string; subject: string }[]>([
    { id: "all", name: "🌟 Barcha Guruhlar", subject: "Umumiy ko'rinish" },
    ...TEACHERS,
  ]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("tm-aziz");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Yangi o'quvchi qo'shish modali
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("+998 ");
  const [addingStudent, setAddingStudent] = useState(false);

  // Bugungi sana (YYYY-MM-DD)
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

  // 1. Telegram WebApp Tekshiruvi
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
        try {
          tg.ready();
          tg.expand();
        } catch {}
        setIsTelegram(true);
        const user = tg.initDataUnsafe?.user;
        setTelegramUser(user);

        // Telegram foydalanuvchi ismi bo'yicha ustozni avtomatik topish
        if (user?.first_name) {
          const fn = user.first_name.toLowerCase();
          const match = TEACHERS.find((t) => t.name.toLowerCase().includes(fn));
          if (match) {
            setSelectedTeacherId(match.id);
          }
        }
      } else {
        const savedAuth = sessionStorage.getItem("algoritm_teacher_auth");
        if (savedAuth === "true") {
          setPinAuth(true);
        }
        setIsTelegram(false);
      }
    }
  }, []);

  // 2. Dinamik ustozlar ro'yxatini yuklash
  useEffect(() => {
    fetch("/api/groups?activeOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.groups)) {
          const map = new Map<string, { id: string; name: string; subject: string }>();
          data.groups.forEach((g: Group) => {
            if (g.teacherName && !map.has(g.teacherId)) {
              map.set(g.teacherId, {
                id: g.teacherId,
                name: g.teacherName,
                subject: g.subject,
              });
            }
          });
          const merged = [{ id: "all", name: "🌟 Barcha Guruhlar", subject: "Umumiy ko'rinish" }, ...TEACHERS];
          map.forEach((t) => {
            if (!merged.some((m) => m.id === t.id || m.name.toLowerCase() === t.name.toLowerCase())) {
              merged.push(t);
            }
          });
          setTeacherList(merged);
        }
      })
      .catch(() => {});
  }, []);

  // 3. Guruhlarni yuklash
  const fetchGroups = useCallback(async (teacherId: string) => {
    setLoading(true);
    try {
      const url = teacherId === "all" ? "/api/groups?activeOnly=true" : `/api/groups?teacherId=${teacherId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setSelectedGroupId(data.groups[0].id);
        } else {
          setSelectedGroupId(null);
        }
      }
    } catch {
      setErrorNotice("Guruhlarni yuklab bo'lmadi. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTelegram || pinAuth) {
      fetchGroups(selectedTeacherId);
    }
  }, [selectedTeacherId, fetchGroups, isTelegram, pinAuth]);

  // 4. Tanlangan guruh o'quvchilarini va bugungi davomatini yuklash
  const fetchGroupData = useCallback(async (groupId: string) => {
    try {
      const [stdRes, attRes] = await Promise.all([
        fetch(`/api/students?groupId=${groupId}&status=faol`),
        fetch(`/api/attendance?groupId=${groupId}&date=${todayStr}`),
      ]);

      const stdData = await stdRes.json();
      const attData = await attRes.json();

      if (stdData.success && Array.isArray(stdData.students)) {
        setStudents(stdData.students);

        const initialMap: Record<string, AttendanceStatus> = {};
        const initialNotes: Record<string, string> = {};

        if (attData.success && Array.isArray(attData.records)) {
          attData.records.forEach((r: AttendanceRecord) => {
            initialMap[r.studentId] = r.status;
            if (r.note) initialNotes[r.studentId] = r.note;
          });
        }

        stdData.students.forEach((s: Student) => {
          if (!initialMap[s.id]) {
            initialMap[s.id] = "keldi";
          }
        });

        setAttendance(initialMap);
        setNotes(initialNotes);
      }
    } catch {
      setErrorNotice("O'quvchilar ma'lumotini yuklab bo'lmadi");
    }
  }, [todayStr]);

  useEffect(() => {
    if (selectedGroupId && (isTelegram || pinAuth)) {
      fetchGroupData(selectedGroupId);
    } else {
      setStudents([]);
    }
  }, [selectedGroupId, fetchGroupData, isTelegram, pinAuth]);

  // Barchasini keldi deb belgilash (1-bosish)
  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = "keldi";
    });
    setAttendance(updated);
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
  };

  // Yakka o'quvchi statusini o'zgartirish
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    } catch {}
  };

  // Davomatni saqlash
  const handleSaveAttendance = async () => {
    if (!selectedGroupId || students.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);
    setErrorNotice(null);

    const teacher = teacherList.find((t) => t.id === selectedTeacherId);
    const records = students.map((s) => ({
      groupId: selectedGroupId,
      studentId: s.id,
      date: todayStr,
      status: attendance[s.id] || "keldi",
      note: notes[s.id] || undefined,
      markedBy: teacher?.name || "Ustoz",
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        try {
          (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
        } catch {}
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorNotice(data.error || "Saqlashda xatolik yuz berdi");
      }
    } catch {
      setErrorNotice("Internet bilan aloqa yo'q. Qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  // PIN tekshirish
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "2026" || pinInput === "1234") {
      sessionStorage.setItem("algoritm_teacher_auth", "true");
      setPinAuth(true);
      setShowPinModal(false);
      setPinError("");
    } else {
      setPinError("Noto'g'ri PIN-kod. Qayta urinib ko'ring.");
    }
  };

  // Yangi o'quvchi qo'shish
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedGroupId) return;
    setAddingStudent(true);
    try {
      const res = await fetch("/api/students", {
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
        fetchGroupData(selectedGroupId);
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

  // ────────────────── 1. BRAUZER UCHUN HIMOYALANGAN EKRAN ──────────────────
  if (isTelegram === false && !pinAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 shadow-inner">
            <Lock className="w-7 h-7 text-brand-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Maxfiy Portal
            </span>
            <h2 className="text-xl font-extrabold text-white">Algoritm Ustoz Davomat Portali</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Xavfsizlik talablariga ko'ra ushbu sahifa ochiq brauzerlar uchun yopiq. Davomat qilish uchun rasmiy <b>Algoritm Telegram Boti</b> orqali kiring.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="https://t.me/algoritm_uz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Telegram Bot orqali ochish</span>
            </a>

            <button
              onClick={() => setShowPinModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Ustoz PIN-kodi bilan kirish</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-500">
            Algoritm Academy & School · Boshqaruv Tizimi
          </div>
        </div>

        {/* PIN Kod Modali */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-xs bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto text-brand-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ustoz PIN-kodini kiriting</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Xodimlar va o'qituvchilar uchun 4 xonali maxfiy kod
                </p>
              </div>
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full py-3 rounded-xl bg-slate-950 border border-white/15 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-brand-500"
                />
                {pinError && <p className="text-[11px] text-rose-400">{pinError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold shadow-md"
                  >
                    Kirish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────── 2. TELEGRAM MINI APP INTERFEYSI ──────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      {/* Yuqori qism (Telegram Header) */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-xs">
              AA
            </div>
            <div>
              <h1 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>{telegramUser ? `Salom, ${telegramUser.first_name}!` : "Elektron Davomat"}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {isTelegram ? "Telegram App" : "Ustoz Portali"}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 capitalize">
                <Calendar className="w-2.5 h-2.5 text-brand-400" />
                <span>{todayFormattedUz}</span>
              </p>
            </div>
          </div>

          {isTelegram && (
            <button
              onClick={() => {
                try {
                  (window as any).Telegram?.WebApp?.close();
                } catch {}
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              Yopish
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-3.5 py-3 space-y-3.5">
        {/* Ustozni tanlash (Kompakt) */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ustoz profili:
            </label>
            <span className="text-[10px] text-brand-400 font-mono">
              {teacherList.find((t) => t.id === selectedTeacherId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {teacherList.map((t) => {
              const isSelected = selectedTeacherId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`p-2 rounded-xl text-left transition border cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-brand-500 text-slate-950 border-brand-400 shadow-sm font-bold"
                      : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-xs truncate">{t.name}</span>
                  <span className={`text-[9px] truncate mt-0.5 ${isSelected ? "text-slate-900/80" : "text-slate-500"}`}>
                    {t.subject}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guruhlar ro'yxati (Karusel) */}
        {loading ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-xs">Guruhlar yuklanmoqda...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center bg-slate-900 border border-white/10 rounded-2xl space-y-2">
            <p className="text-xs text-slate-400">Ushbu ustozga biriktirilgan faol guruhlar topilmadi.</p>
            <p className="text-[11px] text-slate-500">Admin panel orqali yangi guruh qo'shishingiz mumkin.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-bold">
              <span>GURUHLAR:</span>
              <span className="font-mono text-brand-400">{groups.length} ta guruh</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {groups.map((g) => {
                const isSelected = selectedGroupId === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-left shrink-0 transition border cursor-pointer space-y-0.5 ${
                      isSelected
                        ? "bg-slate-800 border-brand-500 ring-1 ring-brand-500/50 shadow-md"
                        : "bg-slate-900/90 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{g.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>{g.time}</span>
                      <span>·</span>
                      <span className="text-brand-400">{g.days}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tanlangan guruh tafsilotlari va O'quvchilar ro'yxati */}
        {selectedGroup && (
          <div className="space-y-3">
            {/* Guruh kartasi va tezkor amallar */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedGroup.name}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{selectedGroup.time} ({selectedGroup.room})</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllPresent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Barcha o'quvchilarni bir vaqtda keldi deb belgilash"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Barchasi keldi</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Yangi o'quvchi qo'shish"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* O'quvchilar ro'yxati */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-bold">
                <span>O'QUVCHILAR ({students.length} ta):</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {Object.values(attendance).filter((st) => st === "keldi").length} keldi ·{" "}
                  {Object.values(attendance).filter((st) => st === "sababli").length} sababli
                </span>
              </div>

              {students.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-white/10 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-400">Bu guruhda hali o'quvchilar yo'q.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + O'quvchi qo'shish
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student, idx) => {
                    const st = attendance[student.id] || "keldi";
                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-2xl border transition space-y-2 ${
                          st === "keldi"
                            ? "bg-emerald-950/20 border-emerald-500/30"
                            : st === "sababli"
                            ? "bg-amber-950/20 border-amber-500/30"
                            : "bg-rose-950/20 border-rose-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs font-mono w-5">{idx + 1}.</span>
                            <span className="font-bold text-xs text-white">{student.name}</span>
                          </div>

                          {/* 3 ta status tugmasi */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setStudentStatus(student.id, "keldi")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                st === "keldi"
                                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Keldi</span>
                            </button>

                            <button
                              onClick={() => setStudentStatus(student.id, "sababli")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                st === "sababli"
                                  ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                              title="Uzrli sabab bilan qatnashmadi"
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>Sababli</span>
                            </button>

                            <button
                              onClick={() => setStudentStatus(student.id, "kelmadi")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                st === "kelmadi"
                                  ? "bg-rose-500 text-white shadow-sm font-extrabold"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Kelmadi</span>
                            </button>
                          </div>
                        </div>

                        {st === "sababli" && (
                          <div className="text-[10px] text-amber-300/90 font-medium pl-7">
                            ℹ️ Sababli qoldirilgan — davomat vedomostida alohida qayd etiladi.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Pastki Yopishqoq Saqlash Paneli */}
      {selectedGroup && students.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-3 shadow-2xl">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Davomat holati:</span>
              <span className="text-xs font-bold text-white">
                {Object.values(attendance).filter((s) => s === "keldi").length} / {students.length} o'quvchi
              </span>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-brand-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Davomat Saqlandi!</span>
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

      {/* Yangi o'quvchi qo'shish Modali */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-brand-400" />
                <span>Guruhga O'quvchi Qo'shish</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  O'quvchi F.I.Sh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Azizbek Aliyev"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Telefon raqami
                </label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={addingStudent || !newStudentName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {addingStudent ? "Qo'shilmoqda..." : "Guruhga qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
