"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Key,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  Ban,
  RefreshCw,
  Pencil,
} from "lucide-react";
import type {
  Group,
  Student,
  StudentMonthlyBilling,
} from "@/lib/attendanceTypes";
import { sanitizeCsvField } from "@/lib/sanitize";

export interface AdminTeacherItem {
  id: string;
  name: string;
  login: string;
  subject: string;
  phone: string;
  status: "active" | "pending" | "blocked";
  createdAt: string;
  hasPassword?: boolean;
  hasTelegram?: boolean;
  telegramId?: string | null;
  telegramUsername?: string | null;
  groupsCount?: number;
  groupNames?: string[];
}

export default function AdminAttendanceModule() {
  const [activeSubTab, setActiveSubTab] = useState<"guruhlar" | "oquvchilar" | "hisob" | "ustozlar">("hisob");
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
  const [newGroupBranch, setNewGroupBranch] = useState("Algoritm Academy (O'quv markazi)");
  const [teacherList, setTeacherList] = useState<AdminTeacherItem[]>([]);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [teacherActionLoading, setTeacherActionLoading] = useState<string | null>(null);

  // Yangi ustoz modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [addTeacherName, setAddTeacherName] = useState("");
  const [addTeacherSubject, setAddTeacherSubject] = useState("");
  const [addTeacherPhone, setAddTeacherPhone] = useState("+998 ");
  const [addTeacherLogin, setAddTeacherLogin] = useState("");
  const [addTeacherPassword, setAddTeacherPassword] = useState("algoritm123");
  const [addTeacherStatus, setAddTeacherStatus] = useState<"active" | "pending">("active");

  // Ustoz parolini yangilash modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetTeacherTarget, setResetTeacherTarget] = useState<AdminTeacherItem | null>(null);
  const [newTeacherPassword, setNewTeacherPassword] = useState("");

  // Ustoz ma'lumotlarini tahrirlash modal
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [editTeacherTarget, setEditTeacherTarget] = useState<AdminTeacherItem | null>(null);
  const [editTeacherName, setEditTeacherName] = useState("");
  const [editTeacherSubject, setEditTeacherSubject] = useState("");
  const [editTeacherPhone, setEditTeacherPhone] = useState("");
  const [editTeacherLogin, setEditTeacherLogin] = useState("");

  // Guruhni tahrirlash modal
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editGroupTarget, setEditGroupTarget] = useState<Group | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupSubject, setEditGroupSubject] = useState("");
  const [editGroupTeacherId, setEditGroupTeacherId] = useState("");
  const [editGroupTeacherName, setEditGroupTeacherName] = useState("");
  const [editGroupDays, setEditGroupDays] = useState<string>("dush-chor-juma");
  const [editGroupTime, setEditGroupTime] = useState("");
  const [editGroupRoom, setEditGroupRoom] = useState("");
  const [editGroupPrice, setEditGroupPrice] = useState("");

  const [newGroupDays, setNewGroupDays] = useState<string>("dush-chor-juma");
  const [newGroupTime, setNewGroupTime] = useState("14:00 - 15:30");
  const [newGroupRoom, setNewGroupRoom] = useState("201-xona");
  const [newGroupPrice, setNewGroupPrice] = useState("450000");

  // Yangi o'quvchi modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("+998 ");
  const [newStudentParent, setNewStudentParent] = useState("+998 ");
  const [newStudentGroupId, setNewStudentGroupId] = useState("");

  // Ustozlarni yuklash
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch("/api/teachers/auth?scope=admin");
      const data = await res.json();
      if (data.teachers && Array.isArray(data.teachers)) {
        setTeacherList(data.teachers);
        if (data.teachers.length > 0) {
          setNewGroupTeacherId((prev) => prev || data.teachers[0].id);
          setNewGroupTeacher((prev) => prev || data.teachers[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Guruhlarni yuklash
  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups?activeOnly=false");
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setSelectedGroupId((prev) => prev || data.groups[0].id);
          setNewStudentGroupId((prev) => prev || data.groups[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // O'quvchilarni yuklash
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Tanlangan guruh va oy bo'yicha to'lov/davomat hisobini yuklash
  const fetchBilling = useCallback(async (groupId: string, month: string) => {
    if (!groupId) return;
    try {
      const res = await fetch(`/api/attendance?groupId=${groupId}&month=${month}&billing=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.billing)) {
        setBillingList(data.billing);
      } else {
        setBillingList([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const initData = async () => {
      try {
        const [gRes, sRes, tRes] = await Promise.all([
          fetch("/api/groups?activeOnly=false").then((r) => r.json()).catch(() => ({})),
          fetch("/api/students").then((r) => r.json()).catch(() => ({})),
          fetch("/api/teachers/auth?scope=admin").then((r) => r.json()).catch(() => ({})),
        ]);
        if (ignore) return;
        if (gRes?.success && Array.isArray(gRes.groups)) {
          setGroups(gRes.groups);
          if (gRes.groups.length > 0) {
            setSelectedGroupId((prev) => prev || gRes.groups[0].id);
            setNewStudentGroupId((prev) => prev || gRes.groups[0].id);
          }
        }
        if (sRes?.success && Array.isArray(sRes.students)) {
          setStudents(sRes.students);
        }
        if (tRes?.teachers && Array.isArray(tRes.teachers)) {
          setTeacherList(tRes.teachers);
          if (tRes.teachers.length > 0) {
            setNewGroupTeacherId((prev) => prev || tRes.teachers[0].id);
            setNewGroupTeacher((prev) => prev || tRes.teachers[0].name);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    void initData();
    return () => {
      ignore = true;
    };
  }, []);

  // Ustozni tasdiqlash
  const handleApproveTeacher = async (teacherId: string) => {
    setTeacherActionLoading(teacherId);
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update-status",
          teacherId,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success) {
        void fetchTeachers();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch {
      alert("Aloqa xatosi");
    } finally {
      setTeacherActionLoading(null);
    }
  };

  // Ustozni bloklash yoki qayta faollashtirish
  const handleToggleTeacherStatus = async (teacher: AdminTeacherItem) => {
    const nextStatus = teacher.status === "active" ? "blocked" : "active";
    const confirmMsg =
      nextStatus === "blocked"
        ? `${teacher.name} ustozni bloklamoqchimisiz? U tizimga kira olmaydi.`
        : `${teacher.name} ustozni qayta faollashtirmoqchimisiz?`;
    if (!window.confirm(confirmMsg)) return;

    setTeacherActionLoading(teacher.id);
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update-status",
          teacherId: teacher.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        void fetchTeachers();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch {
      alert("Aloqa xatosi");
    } finally {
      setTeacherActionLoading(null);
    }
  };

  // Ustozni o'chirish
  const handleDeleteTeacher = async (teacher: AdminTeacherItem) => {
    if (!window.confirm(`DIQQAT: ${teacher.name} ustozni butunlay o'chirib tashlamoqchimisiz?`)) return;

    setTeacherActionLoading(teacher.id);
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-teacher",
          teacherId: teacher.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        void fetchTeachers();
        void fetchGroups();
      } else {
        alert(data.error || "O'chirishda xatolik");
      }
    } catch {
      alert("Aloqa xatosi");
    } finally {
      setTeacherActionLoading(null);
    }
  };

  // Barcha ro'yxatdan o'tgan ustozlarni tozalab, boshlang'ich toza holatga keltirish
  const handleResetAllTeachers = async () => {
    if (!window.confirm("Barcha ro'yxatdan o'tgan yangi ustozlarni tozalab, faqat rasmiy asosiy ustozlar ro'yxatini qoldirmoqchimisiz?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-teachers" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Ustozlar ro'yxati toza boshlang'ich holatga keltirildi!");
        void fetchTeachers();
        void fetchGroups();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan aloqa xatosi");
    } finally {
      setLoading(false);
    }
  };

  // Yangi ustoz yaratish
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-create-teacher",
          name: addTeacherName,
          subject: addTeacherSubject,
          phone: addTeacherPhone,
          login: addTeacherLogin,
          password: addTeacherPassword,
          status: addTeacherStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTeacherModal(false);
        setAddTeacherName("");
        setAddTeacherSubject("");
        setAddTeacherPhone("+998 ");
        setAddTeacherLogin("");
        setAddTeacherPassword("");
        void fetchTeachers();
      } else {
        alert(data.error || "Yaratishda xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan aloqa xatosi");
    }
  };

  // Ustoz parolini yangilash (reset)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTeacherTarget) return;
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-reset-password",
          teacherId: resetTeacherTarget.id,
          newPassword: newTeacherPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowResetPasswordModal(false);
        setResetTeacherTarget(null);
        setNewTeacherPassword("");
        alert("Ustoz paroli muvaffaqiyatli yangilandi!");
        void fetchTeachers();
      } else {
        alert(data.error || "Parolni yangilashda xato");
      }
    } catch {
      alert("Aloqa xatosi");
    }
  };

  // Ustoz ma'lumotlarini tahrirlash (ism, fan, login, telefon)
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacherTarget) return;
    try {
      const res = await fetch("/api/teachers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update-teacher",
          teacherId: editTeacherTarget.id,
          name: editTeacherName.trim(),
          subject: editTeacherSubject.trim(),
          phone: editTeacherPhone.trim(),
          login: editTeacherLogin.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditTeacherModal(false);
        setEditTeacherTarget(null);
        void fetchTeachers();
      } else {
        alert(data.error || "Ustozni tahrirlashda xatolik");
      }
    } catch {
      alert("Aloqa xatosi");
    }
  };

  // Guruhni tahrirlash (ustoz, vaqt, xona, narx va h.k.)
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroupTarget) return;
    try {
      const res = await fetch("/api/groups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editGroupTarget.id,
          name: editGroupName.trim(),
          subject: editGroupSubject.trim(),
          teacherId: editGroupTeacherId,
          teacherName: editGroupTeacherName,
          days: editGroupDays,
          time: editGroupTime.trim(),
          room: editGroupRoom.trim(),
          monthlyPrice: Number(editGroupPrice) || 450000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditGroupModal(false);
        setEditGroupTarget(null);
        void fetchGroups();
        void fetchTeachers();
      } else {
        alert(data.error || "Guruhni yangilashda xatolik");
      }
    } catch {
      alert("Aloqa xatosi");
    }
  };

  // Guruhni o'chirish
  const handleDeleteGroup = async (group: Group) => {
    if (!window.confirm(`⚠️ DIQQAT: '${group.name}' guruhini o'chirmoqchimisiz? Guruh bilan birga o'quvchilar va davomat ham o'chiriladi.`)) return;
    try {
      const res = await fetch(`/api/groups?id=${group.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        void fetchGroups();
        void fetchStudents();
        void fetchTeachers();
        if (selectedGroupId === group.id) {
          setSelectedGroupId("");
        }
      } else {
        alert(data.error || "Guruhni o'chirishda xatolik");
      }
    } catch {
      alert("Aloqa xatosi");
    }
  };

  useEffect(() => {
    if (!selectedGroupId || !selectedMonth) return;
    let ignore = false;
    const loadBilling = async () => {
      try {
        const res = await fetch(`/api/attendance?groupId=${selectedGroupId}&month=${selectedMonth}&billing=true`);
        const data = await res.json();
        if (ignore) return;
        if (data.success && Array.isArray(data.billing)) {
          setBillingList(data.billing);
        } else {
          setBillingList([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    void loadBilling();
    return () => {
      ignore = true;
    };
  }, [selectedGroupId, selectedMonth]);

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
          teacherId: newGroupTeacherId || undefined,
          days: newGroupDays,
          time: newGroupTime,
          room: newGroupRoom,
          monthlyPrice: Number(newGroupPrice),
          lessonsPerMonth: 12,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setShowGroupModal(false);
        setNewGroupName("");
        setNewGroupSubject("");
        setNewGroupTeacher("");
        void fetchGroups();
      } else {
        alert(data.error || "Guruhni yaratib bo'lmadi");
      }
    } catch {
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
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setShowStudentModal(false);
        setNewStudentName("");
        setNewStudentPhone("+998 ");
        setNewStudentParent("+998 ");
        void fetchStudents();
        if (selectedGroupId) void fetchBilling(selectedGroupId, selectedMonth);
      } else {
        alert(data.error || "O'quvchini qo'shib bo'lmadi");
      }
    } catch {
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
        sanitizeCsvField(b.studentName),
        sanitizeCsvField(b.groupName),
        sanitizeCsvField(b.month),
        b.standardLessons,
        b.attendedCount,
        b.excusedCount,
        b.unexcusedCount,
        sanitizeCsvField(`${rate}%`),
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

  const pendingTeachersCount = useMemo(() => {
    return teacherList.filter((t) => t.status === "pending").length;
  }, [teacherList]);

  const filteredTeachers = useMemo(() => {
    return teacherList.filter((t) => {
      const q = searchTeacher.toLowerCase().trim();
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.login.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.phone.includes(q)
      );
    });
  }, [teacherList, searchTeacher]);

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

          <button
            onClick={() => setActiveSubTab("ustozlar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeSubTab === "ustozlar"
                ? "bg-brand-500 text-slate-950 shadow-md font-extrabold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Ustozlar Jamoasi ({teacherList.length})</span>
            {pendingTeachersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-slate-950 font-bold">
                {pendingTeachersCount}
              </span>
            )}
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditGroupTarget(g);
                        setEditGroupName(g.name);
                        setEditGroupSubject(g.subject);
                        setEditGroupTeacherId(g.teacherId || "");
                        setEditGroupTeacherName(g.teacherName || "");
                        setEditGroupDays(g.days);
                        setEditGroupTime(g.time);
                        setEditGroupRoom(g.room);
                        setEditGroupPrice(String(g.monthlyPrice));
                        setShowEditGroupModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Guruhni tahrirlash"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => void handleDeleteGroup(g)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Guruhni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setActiveSubTab("hisob");
                    }}
                    className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-0.5 cursor-pointer"
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

      {/* ──────────────── 4. USTOZLAR BO'LIMI ──────────────── */}
      {activeSubTab === "ustozlar" && (
        <div className="space-y-4">
          {/* Status hisoblagichlari */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jami Ustozlar</p>
                <p className="text-2xl font-black text-white font-mono mt-0.5">{teacherList.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faol Ustozlar</p>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {teacherList.filter((t) => t.status === "active").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div
              className={`border rounded-2xl p-4 flex items-center justify-between transition ${
                pendingTeachersCount > 0 ? "bg-amber-500/15 border-amber-500/30" : "bg-white/5 border-white/10"
              }`}
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tasdiqlash Kutilmoqda
                </p>
                <p
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    pendingTeachersCount > 0 ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  {pendingTeachersCount}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pendingTeachersCount > 0 ? "bg-amber-500/30 text-amber-300" : "bg-white/5 text-slate-500"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Boshlang'ich parol va ma'lumot eslatmasi */}
          <div className="bg-brand-500/10 border border-brand-500/25 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-brand-300">
              <Key className="w-4 h-4 text-brand-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-xs">Boshlang&apos;ich ustozlar uchun standart parol: <span className="text-amber-400 font-mono font-black">algoritm123</span></p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ustozlar o&apos;z logini va ushbu parol orqali <b>/davomat</b> tizimiga kirishlari mumkin. Parolni har bir ustoz qatoridagi kalit belgisi orqali yangilashingiz mumkin.</p>
              </div>
            </div>
          </div>

          {/* Qidiruv va Yangi qo'shish paneli */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ustoz ismi, fani, telefoni yoki login bo'yicha qidirish..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void fetchTeachers()}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                title="Yangilash"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => void handleResetAllTeachers()}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                title="Barcha ro'yxatdan o'tganlarni tozalab, boshlang'ich toza holatga keltirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tozalash (Reset)</span>
              </button>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Yangi Ustoz Qo'shish</span>
              </button>
            </div>
          </div>

          {/* Ustozlar jadvali */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Ustoz F.I.Sh & Mutaxassislik</th>
                    <th className="py-3 px-4">Login & Telefon</th>
                    <th className="py-3 px-4">Telegram Holati</th>
                    <th className="py-3 px-4">Biriktirilgan Guruhlar</th>
                    <th className="py-3 px-4 text-center">Holati</th>
                    <th className="py-3 px-4 text-right">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Ustozlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => {
                      const isPending = t.status === "pending";
                      const isBlocked = t.status === "blocked";
                      const isActive = t.status === "active";
                      const isLoading = teacherActionLoading === t.id;

                      return (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-teal-500/20 text-brand-300 font-bold flex items-center justify-center border border-brand-500/30 text-xs">
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{t.name}</p>
                                <p className="text-[11px] text-slate-400">{t.subject}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <p className="text-brand-300 font-semibold">@{t.login}</p>
                            <p className="text-slate-400">{t.phone || "—"}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            {t.hasTelegram ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/20 text-[11px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                                <span>Ulangan</span>
                                {t.telegramUsername && <span>(@{t.telegramUsername})</span>}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Ulanmagan</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[11px] font-semibold">
                              {t.groupsCount ?? 0} ta guruh
                            </span>
                            {t.groupNames && t.groupNames.length > 0 && (
                              <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]" title={t.groupNames.join(", ")}>
                                {t.groupNames.join(", ")}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                                <span>Kutilmoqda</span>
                              </span>
                            )}
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                                <span>Faol</span>
                              </span>
                            )}
                            {isBlocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                                <span>Bloklangan</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tasdiqlash (Pending bo'lsa) */}
                              {isPending && (
                                <button
                                  onClick={() => handleApproveTeacher(t.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition flex items-center gap-1 shadow-md cursor-pointer"
                                  title="Arizani tasdiqlash va faollashtirish"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Tasdiqlash</span>
                                </button>
                              )}

                              {/* Bloklash / Qayta ochish */}
                              {isActive && (
                                <button
                                  onClick={() => handleToggleTeacherStatus(t)}
                                  disabled={isLoading}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                                  title="Ustozni vaqtincha bloklash"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isBlocked && (
                                <button
                                  onClick={() => handleToggleTeacherStatus(t)}
                                  disabled={isLoading}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition cursor-pointer"
                                  title="Blokdan chiqarish"
                                >
                                  Faollashtirish
                                </button>
                              )}

                              {/* Tahrirlash (Ism, Fan, Login, Tel) */}
                              <button
                                onClick={() => {
                                  setEditTeacherTarget(t);
                                  setEditTeacherName(t.name);
                                  setEditTeacherSubject(t.subject);
                                  setEditTeacherPhone(t.phone || "");
                                  setEditTeacherLogin(t.login);
                                  setShowEditTeacherModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                                title="Ustoz ma'lumotlarini tahrirlash"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Parolni tiklash / yangilash */}
                              <button
                                onClick={() => {
                                  setResetTeacherTarget(t);
                                  setNewTeacherPassword("");
                                  setShowResetPasswordModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                                title="Yangi parol berish"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* O'chirish */}
                              <button
                                onClick={() => handleDeleteTeacher(t)}
                                disabled={isLoading}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                title="Ustozni butunlay o'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
                    <option value="Algoritm Academy (O'quv markazi)">Algoritm Academy (O&apos;quv markazi)</option>
                    <option value="Algoritm School (Xususiy maktab)">Algoritm School (Xususiy maktab)</option>
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

      {/* ──────────────── MODAL: YANGI USTOZ QO'SHISH ──────────────── */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Yangi Ustoz Qo'shish</h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Ustoz Ism-Familiyasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Komilov"
                  value={addTeacherName}
                  onChange={(e) => setAddTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Fan / Mutaxassislik *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Fizika & Milliy Sertifikat"
                  value={addTeacherSubject}
                  onChange={(e) => setAddTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Login (kirish uchun) *</label>
                  <input
                    type="text"
                    required
                    placeholder="sardor_fizika"
                    value={addTeacherLogin}
                    onChange={(e) => setAddTeacherLogin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Telefon Raqami</label>
                  <input
                    type="tel"
                    value={addTeacherPhone}
                    onChange={(e) => setAddTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Boshlang'ich Parol *</label>
                  <input
                    type="password"
                    required
                    placeholder="Kamida 4 ta belgi"
                    value={addTeacherPassword}
                    onChange={(e) => setAddTeacherPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Boshlang'ich Holati</label>
                  <select
                    value={addTeacherStatus}
                    onChange={(e) => setAddTeacherStatus(e.target.value as "active" | "pending")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="active">Faol (Active)</option>
                    <option value="pending">Kutilmoqda (Pending)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                Ustoz ushbu login va parol orqali saytdagi <b>/davomat</b> portaliga yoki Telegram botdagi <b>/login</b> orqali tizimga kira oladi.
              </p>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Ustozni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: USTOZ PAROLINI YANGILASH ──────────────── */}
      {showResetPasswordModal && resetTeacherTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Parolni Yangilash</h3>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Ustoz:</p>
                <p className="font-bold text-white text-sm">{resetTeacherTarget.name}</p>
                <p className="text-brand-300 font-mono text-[11px]">Login: @{resetTeacherTarget.login}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Yangi Parol *</label>
                <input
                  type="password"
                  required
                  placeholder="Yangi parolni kiriting (min 4 ta belgi)"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                Yangi parol o&apos;rnatilgach, ustoz darhol yangi parol bilan kirishi mumkin bo&apos;ladi.
              </p>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Parolni Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: USTOZNI TAHRIRLASH ──────────────── */}
      {showEditTeacherModal && editTeacherTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Ustoz Ma&apos;lumotlarini Tahrirlash</h3>
              </div>
              <button
                onClick={() => setShowEditTeacherModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Ustoz Ism-Familiyasi *</label>
                <input
                  type="text"
                  required
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Fan / Mutaxassislik *</label>
                <input
                  type="text"
                  required
                  value={editTeacherSubject}
                  onChange={(e) => setEditTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Login *</label>
                  <input
                    type="text"
                    required
                    value={editTeacherLogin}
                    onChange={(e) => setEditTeacherLogin(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Telefon Raqami</label>
                  <input
                    type="tel"
                    value={editTeacherPhone}
                    onChange={(e) => setEditTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: GURUHNI TAHRIRLASH ──────────────── */}
      {showEditGroupModal && editGroupTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Guruhni Tahrirlash</h3>
              </div>
              <button onClick={() => setShowEditGroupModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Guruh Nomi *</label>
                <input
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Fan Yo&apos;nalishi *</label>
                <input
                  type="text"
                  required
                  value={editGroupSubject}
                  onChange={(e) => setEditGroupSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Biriktirilgan Ustoz *</label>
                {teacherList.length > 0 ? (
                  <select
                    value={editGroupTeacherId}
                    onChange={(e) => {
                      setEditGroupTeacherId(e.target.value);
                      const t = teacherList.find((item) => item.id === e.target.value);
                      if (t) setEditGroupTeacherName(t.name);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-brand-400"
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
                    value={editGroupTeacherName}
                    onChange={(e) => setEditGroupTeacherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Dars Kunlari</label>
                  <select
                    value={editGroupDays}
                    onChange={(e) => setEditGroupDays(e.target.value)}
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
                    value={editGroupTime}
                    onChange={(e) => setEditGroupTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Xona</label>
                  <input
                    type="text"
                    value={editGroupRoom}
                    onChange={(e) => setEditGroupRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Oylik To&apos;lov (so&apos;m)</label>
                  <input
                    type="number"
                    value={editGroupPrice}
                    onChange={(e) => setEditGroupPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Guruhni Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
