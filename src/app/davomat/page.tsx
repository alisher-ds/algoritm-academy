"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
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

  // Yangi qo'shilgan ustozlarni bazadan avtomatik yuklab olish
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

  // Guruhlarni yuklash
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
    fetchGroups(selectedTeacherId);
  }, [selectedTeacherId, fetchGroups]);

  // Tanlangan guruh o'quvchilarini va bugungi davomatini yuklash
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

        // Boshlang'ich davomat holati
        const initialMap: Record<string, AttendanceStatus> = {};
        const initialNotes: Record<string, string> = {};

        // Avval saqlangan davomat bo'lsa tiklaymiz
        if (attData.success && Array.isArray(attData.records)) {
          attData.records.forEach((r: AttendanceRecord) => {
            initialMap[r.studentId] = r.status;
            if (r.note) initialNotes[r.studentId] = r.note;
          });
        }

        // Belgilanmaganlarga standart "keldi" qo'yamiz
        stdData.students.forEach((s: Student) => {
          if (!initialMap[s.id]) {
            initialMap[s.id] = "keldi";
          }
        });

        setAttendance(initialMap);
        setNotes(initialNotes);
      }
    } catch {
      setErrorNotice("O'quvchilar ro'yxatini yuklab bo'lmadi.");
    }
  }, [todayStr]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupData(selectedGroupId);
    } else {
      setStudents([]);
    }
  }, [selectedGroupId, fetchGroupData]);

  // Barchasini keldi deb belgilash (1-bosish)
  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = "keldi";
    });
    setAttendance(updated);
  };

  // Yakka o'quvchi statusini o'zgartirish
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
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

  // Yangi o'quvchi qo'shish
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !newStudentName.trim()) return;
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

  // O'quvchini guruhdan chiqarish
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`${studentName} ni haqiqatan ham ushbu guruhdan chiqarmoqchimisiz?`)) return;
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId, status: "ketdi" }),
      });
      if (res.ok) {
        if (selectedGroupId) fetchGroupData(selectedGroupId);
      }
    } catch {
      alert("Xatolik yuz berdi");
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Yuqori qism (Header) */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
                <span>Elektron Davomat</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Ustoz Portali
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 capitalize">
                <Calendar className="w-3 h-3 text-brand-400" />
                <span>{todayFormattedUz}</span>
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="text-xs font-semibold text-slate-400 hover:text-brand-400 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Ustozni tanlash */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-3.5 shadow-sm">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ustozni tanlang:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {teacherList.map((t) => {
              const isSelected = selectedTeacherId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`p-2.5 rounded-xl text-left transition border cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-brand-500 text-slate-950 border-brand-400 shadow-md font-bold"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="text-xs truncate">{t.name}</span>
                  <span
                    className={`text-[9px] truncate mt-0.5 ${
                      isSelected ? "text-slate-900/80" : "text-slate-400"
                    }`}
                  >
                    {t.subject}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guruhlar ro'yxati (Karusel / Tablar) */}
        {loading ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-xs">Guruhlar yuklanmoqda...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center bg-slate-900 border border-white/10 rounded-2xl">
            <p className="text-xs text-slate-400">Bu ustozga biriktirilgan faol guruhlar topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
              <span>GURUHLARINGIZ:</span>
              <span>{groups.length} ta guruh</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {groups.map((g) => {
                const isSelected = selectedGroupId === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`shrink-0 px-4 py-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-brand-400 shadow-lg"
                        : "bg-slate-900 text-slate-300 border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{g.name}</span>
                    <div className="flex items-center gap-2 text-[10px] opacity-90">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {g.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {g.room}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tanlangan guruhdagi o'quvchilar va davomat */}
        {selectedGroup && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedGroup.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/10 text-brand-300">
                    {students.length} nafar o'quvchi
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kunlari: {selectedGroup.days} | {selectedGroup.time} | {selectedGroup.room}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllPresent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Barchasini keldi deb belgilash"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Barchasi keldi</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ O'quvchi</span>
                </button>
              </div>
            </div>

            {/* O'quvchilar ro'yxati */}
            {students.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p>Ushbu guruhda hozircha o'quvchilar yo'q.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1 text-brand-400 font-bold hover:underline"
                >
                  Birinchi o'quvchini qo'shing
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {students.map((std, idx) => {
                  const status = attendance[std.id] || "keldi";
                  return (
                    <div
                      key={std.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-white/15"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {std.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" /> {std.phone}
                            </span>
                            {std.parentPhone && (
                              <span>• Ota-ona: {std.parentPhone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3 ta rangli tugma (Keldi, Kelmadi, Sababli) */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(std.id, "keldi")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === "keldi"
                              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                              : "bg-white/5 text-slate-400 hover:text-emerald-400"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Keldi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentStatus(std.id, "kelmadi")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === "kelmadi"
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                              : "bg-white/5 text-slate-400 hover:text-rose-400"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Kelmadi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt("Sababini kiriting (masalan: Kasal bo'lgan):", notes[std.id] || "Uzrli sabab");
                            if (reason !== null) {
                              setStudentStatus(std.id, "sababli");
                              setNotes((prev) => ({ ...prev, [std.id]: reason }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            status === "sababli"
                              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                              : "bg-white/5 text-slate-400 hover:text-amber-400"
                          }`}
                          title={notes[std.id] ? notes[std.id] : "Sababli dars qoldirish"}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Sababli</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(std.id, std.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition cursor-pointer ml-1"
                          title="Guruhdan chiqarish"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Xabarnoma / Xatoliklar */}
        {errorNotice && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold animate-fade-in shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Bugungi davomat muvaffaqiyatli saqlandi!</span>
          </div>
        )}
      </main>

      {/* Pastki yopishqoq saqlash paneli (Sticky Footer) */}
      {selectedGroup && students.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-3.5 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-slate-400">Jami o'quvchilar:</span>{" "}
              <span className="font-bold text-white">{students.length} ta</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">
                {Object.values(attendance).filter((s) => s === "keldi").length} keldi
              </span>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
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

      {/* O'quvchi qo'shish modali */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <UserPlus className="w-4 h-4 text-brand-400" />
                <span>Guruhga Yangi O'quvchi Qo'shish</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  O'quvchi Ism-Familiyasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardorbek Alimov"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Telefon Raqami *
                </label>
                <input
                  type="tel"
                  required
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {addingStudent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Guruhga Qo'shish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
