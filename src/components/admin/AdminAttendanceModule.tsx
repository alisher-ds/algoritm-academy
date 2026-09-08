"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import type {
  Group,
  Student,
  AttendanceRecord,
  StudentMonthlyBilling,
} from "@/lib/attendanceTypes";

export default function AdminAttendanceModule() {
  const [activeSubTab, setActiveSubTab] = useState<"guruhlar" | "oquvchilar" | "hisob">("hisob");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [billingList, setBillingList] = useState<StudentMonthlyBilling[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");

  // Tanlangan oy (YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Yangi guruh modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubject, setNewGroupSubject] = useState("");
  const [newGroupTeacher, setNewGroupTeacher] = useState("");
  const [newGroupTeacherId, setNewGroupTeacherId] = useState("");
  const [newGroupBranch, setNewGroupBranch] = useState("Chilonzor filiali");
  const [teacherList, setTeacherList] = useState<Array<{ id: string; name: string; subject: string }>>([]);
  const [newGroupDays, setNewGroupDays] = useState<any>("dush-chor-juma");
  const [newGroupTime, setNewGroupTime] = useState("14:00 - 15:30");
  const [newGroupRoom, setNewGroupRoom] = useState("201-xona");
  const [newGroupPrice, setNewGroupPrice] = useState("450000");

  // Yangi o'quvchi modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("+998 ");
  const [newStudentParent, setNewStudentParent] = useState("+998 ");
  const [newStudentGroupId, setNewStudentGroupId] = useState("");

  // Guruhlarni yuklash
  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups?activeOnly=false");
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
        if (data.groups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data.groups[0].id);
          setNewStudentGroupId(data.groups[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedGroupId]);

  // Ustozlarni yuklash
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch("/api/teachers/auth");
      const data = await res.json();
      if (data.teachers && Array.isArray(data.teachers)) {
        setTeacherList(data.teachers);
        if (data.teachers.length > 0) {
          setNewGroupTeacherId(data.teachers[0].id);
          setNewGroupTeacher(data.teachers[0].name);
        }
      }
    } catch {}
  }, []);

  // O'quvchilarni yuklash
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Tanlangan guruh va oy bo'yicha to'lov/davomat hisobini yuklash
  const fetchBilling = useCallback(async (groupId: string, month: string) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?groupId=${groupId}&month=${month}&billing=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.billing)) {
        setBillingList(data.billing);
      } else {
        setBillingList([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchStudents();
    fetchTeachers();
  }, [fetchGroups, fetchStudents, fetchTeachers]);

  useEffect(() => {
    if (selectedGroupId && selectedMonth) {
      fetchBilling(selectedGroupId, selectedMonth);
    }
  }, [selectedGroupId, selectedMonth, fetchBilling]);

  // Yangi guruh yaratish
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          subject: newGroupSubject,
          teacherName: newGroupTeacher,
          days: newGroupDays,
          time: newGroupTime,
          room: newGroupRoom,
          monthlyPrice: Number(newGroupPrice),
          lessonsPerMonth: 12,
        }),
      });
      if (res.ok) {
        setShowGroupModal(false);
        setNewGroupName("");
        setNewGroupSubject("");
        setNewGroupTeacher("");
        fetchGroups();
      }
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  // Yangi o'quvchi qo'shish
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName,
          phone: newStudentPhone,
          parentPhone: newStudentParent,
          groupId: newStudentGroupId || selectedGroupId,
          status: "faol",
        }),
      });
      if (res.ok) {
        setShowStudentModal(false);
        setNewStudentName("");
        setNewStudentPhone("+998 ");
        setNewStudentParent("+998 ");
        fetchStudents();
        if (selectedGroupId) fetchBilling(selectedGroupId, selectedMonth);
      }
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  // Excelga CSV formatda eksport qilish (Sof darslar davomati, UTF-8 BOM bilan)
  const exportToCsv = () => {
    if (billingList.length === 0) return;
    const activeGrp = groups.find((g) => g.id === selectedGroupId);
    const headers = [
      "№",
      "O'quvchi F.I.Sh",
      "Guruh",
      "Hisob Oyi",
      "Reja Darslar",
      "Qatnashgan (Keldi)",
      "Uzrli (Sababli)",
      "Sababsiz (Kelmadi)",
      "Davomat Foizi (%)",
    ];

    const rows = billingList.map((b, idx) => {
      const rate = b.standardLessons > 0 ? Math.round((b.attendedCount / b.standardLessons) * 100) : 0;
      return [
        idx + 1,
        `"${b.studentName.replace(/"/g, '""')}"`,
        `"${b.groupName.replace(/"/g, '""')}"`,
        b.month,
        b.standardLessons,
        b.attendedCount,
        b.excusedCount,
        b.unexcusedCount,
        `${rate}%`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Davomat_Jurnali_${activeGrp?.name || "guruh"}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchStudent.toLowerCase().trim();
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.phone.includes(q);
    });
  }, [students, searchStudent]);

  const activeGrp = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6">
      {/* Sub-tablar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("hisob")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "hisob"
                ? "bg-brand-500 text-slate-950 shadow-md font-extrabold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Oylik Davomat Jurnali</span>
          </button>

          <button
            onClick={() => setActiveSubTab("guruhlar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "guruhlar"
                ? "bg-brand-500 text-slate-950 shadow-md font-extrabold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Guruhlar & Kurslar ({groups.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("oquvchilar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "oquvchilar"
                ? "bg-brand-500 text-slate-950 shadow-md font-extrabold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>O'quvchilar Bazasi ({students.length})</span>
          </button>
        </div>

        <a
          href="/davomat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition"
        >
          <span>Ustoz Davomat Portalini Ochish</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ──────────────── 1. DAVOMAT VA TO'LOV HISOB-KITOBI ──────────────── */}
      {activeSubTab === "hisob" && (
        <div className="space-y-4">
          {/* Guruh va Oy tanlash paneli */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Guruhni tanlang:
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-bold focus:outline-none"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.teacherName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Hisob Oyi:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToCsv}
                disabled={billingList.length === 0}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (CSV) ga yuklash</span>
              </button>

              <button
                onClick={() => setShowStudentModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ O'quvchi qo'shish</span>
              </button>
            </div>
          </div>

          {/* Ma'lumot jadvali */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeGrp?.name || "Guruh"}</span>
                  <span className="text-[11px] font-mono text-brand-400 font-normal">
                    ({activeGrp?.teacherName} · {activeGrp?.time})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Rejadagi darslar: <b>{activeGrp?.lessonsPerMonth || 12} ta</b> · Xona: {activeGrp?.room || "Asosiy bino"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Jami O'quvchilar:</span>
                  <span className="text-sm font-black text-white">{billingList.length} ta</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">O'rtacha Davomat:</span>
                  <span className="text-sm font-black text-emerald-400">
                    {billingList.length > 0
                      ? Math.round(
                          (billingList.reduce((acc, b) => acc + b.attendedCount, 0) /
                            (billingList.length * (activeGrp?.lessonsPerMonth || 12))) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                <span>Hisob-kitob qilinmoqda...</span>
              </div>
            ) : billingList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p>Ushbu guruhda shu oy uchun hali davomat yozuvlari yo'q.</p>
                <p className="text-[11px] text-slate-500">
                  Ustoz /davomat sahifasidan darsga kelgan/kelmaganlarni belgilashi bilan bu yerda to'lov summasi avtomat chiqadi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[11px] text-slate-400 uppercase tracking-wider border-b border-white/10">
                      <th className="py-3 px-4">№</th>
                      <th className="py-3 px-4">O'quvchi F.I.Sh</th>
                      <th className="py-3 px-4 text-center">Reja Darslar</th>
                      <th className="py-3 px-4 text-center text-emerald-400">Keldi (Qatnashdi)</th>
                      <th className="py-3 px-4 text-center text-amber-300">Sababli (Uzrli)</th>
                      <th className="py-3 px-4 text-center text-rose-400">Kelmadi</th>
                      <th className="py-3 px-4 text-right">Davomat Ko'rsatkichi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                    {billingList.map((b, idx) => {
                      const totalLessons = b.standardLessons || 12;
                      const rate = Math.min(100, Math.round((b.attendedCount / totalLessons) * 100));
                      const rateColor =
                        rate >= 85
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : rate >= 60
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30";

                      return (
                        <tr key={b.studentId} className="hover:bg-white/[0.03] transition">
                          <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-white">
                            <div>{b.studentName}</div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              {b.groupName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-400">
                            {totalLessons} ta
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold font-mono">
                              <CheckCircle2 className="w-3 h-3" /> {b.attendedCount} ta
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {b.excusedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                                <AlertCircle className="w-3 h-3" /> {b.excusedCount} ta
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {b.unexcusedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold font-mono">
                                <XCircle className="w-3 h-3" /> {b.unexcusedCount} ta
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${rateColor}`}>
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── 2. GURUHLAR BO'LIMI ──────────────── */}
      {activeSubTab === "guruhlar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Barcha Guruhlar ({groups.length} ta)</h3>
            <button
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Yangi Guruh Ochish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-white/20 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{g.name}</h4>
                    <span className="text-[11px] text-brand-400">{g.subject}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-slate-300">
                    {g.days}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ustoz: <strong className="text-white">{g.teacherName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vaqt: {g.time} ({g.room})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>Narxi: <strong className="text-emerald-400">{g.monthlyPrice.toLocaleString("uz-UZ")} so'm/oy</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">{g.lessonsPerMonth} ta dars/oy</span>
                  <button
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setActiveSubTab("hisob");
                    }}
                    className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Davomatni ko'rish</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── 3. O'QUVCHILAR BAZASI ──────────────── */}
      {activeSubTab === "oquvchilar" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="O'quvchi ismi yoki telefoni bo'yicha qidirish..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowStudentModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ O'quvchi Qo'shish</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[11px] text-slate-400 uppercase tracking-wider border-b border-white/10">
                    <th className="py-3 px-4">№</th>
                    <th className="py-3 px-4">O'quvchi Ismi</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Ota-ona Telefoni</th>
                    <th className="py-3 px-4">Guruhi</th>
                    <th className="py-3 px-4">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredStudents.map((s, idx) => {
                    const grp = groups.find((g) => g.id === s.groupId);
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.phone}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.parentPhone || "—"}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-brand-300 text-[11px] font-semibold">
                            {grp?.name || s.groupId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: YANGI GURUH OCHISH ──────────────── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold">Yangi Kurs Guruhi Ochish</h3>
              <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Guruh Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: SAT Math Intensive"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Fan Yo'nalishi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Matematika & SAT"
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Filial *</label>
                  <select
                    value={newGroupBranch}
                    onChange={(e) => setNewGroupBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  >
                    <option value="Chilonzor filiali">Chilonzor filiali</option>
                    <option value="Yunusobod filiali">Yunusobod filiali</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Biriktirilgan Ustoz *</label>
                  {teacherList.length > 0 ? (
                    <select
                      value={newGroupTeacherId}
                      onChange={(e) => {
                        setNewGroupTeacherId(e.target.value);
                        const t = teacherList.find((item) => item.id === e.target.value);
                        if (t) setNewGroupTeacher(t.name);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                    >
                      {teacherList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.subject})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Aziz Xolmurodov"
                      value={newGroupTeacher}
                      onChange={(e) => setNewGroupTeacher(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Dars Kunlari</label>
                  <select
                    value={newGroupDays}
                    onChange={(e) => setNewGroupDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  >
                    <option value="dush-chor-juma">Dush-Chor-Juma</option>
                    <option value="sesh-pay-shanba">Sesh-Pay-Shanba</option>
                    <option value="har-kuni">Har kuni</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Dars Vaqti</label>
                  <input
                    type="text"
                    value={newGroupTime}
                    onChange={(e) => setNewGroupTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Xona</label>
                  <input
                    type="text"
                    value={newGroupRoom}
                    onChange={(e) => setNewGroupRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Oylik To'lov (so'm)</label>
                  <input
                    type="number"
                    value={newGroupPrice}
                    onChange={(e) => setNewGroupPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold"
                >
                  Guruhni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: YANGI O'QUVCHI QO'SHISH ──────────────── */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold">Yangi O'quvchi Qo'shish</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">F.I.Sh *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardorbek Alimov"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Telefon Raqami *</label>
                <input
                  type="tel"
                  required
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Ota-ona Telefoni</label>
                <input
                  type="tel"
                  value={newStudentParent}
                  onChange={(e) => setNewStudentParent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Qaysi Guruhga *</label>
                <select
                  value={newStudentGroupId || selectedGroupId}
                  onChange={(e) => setNewStudentGroupId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.teacherName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold"
                >
                  O'quvchini Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
