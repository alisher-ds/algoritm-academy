"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  Phone,
  Search,
  Download,
  Trash2,
  Lock,
  LogOut,
  Info,
  Loader2,
  AlertTriangle,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Edit3,
  Sparkles,
  PhoneCall,
  X,
  ChevronRight,
  Calendar,
  Bookmark,
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  getLocalLeads,
  LEADS_LOCAL_KEY,
  encryptStorage,
  type Lead,
  type LeadStatus,
  type LeadType,
} from "@/lib/leads";
import type { LeadStatsSummary } from "@/lib/leadStore";
import { sanitizeCsvField } from "@/lib/sanitize";

type AuthState = "tekshirilmoqda" | "login" | "tayyor";
type DateRangeOption = "hammasi" | "bugun" | "hafta" | "oy";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 daqiqa harakatsizlik
const IDLE_WARNING_MS = 60 * 1000; // 60 soniya ogohlantirish (14-daqiqada ogohlantiradi)

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("tekshirilmoqda");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStatsSummary | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("hammasi");
  const [typeFilter, setTypeFilter] = useState<string>("hammasi");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeOption>("hammasi");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Lead Details & Admin Notes modal
  const [activeLeadModal, setActiveLeadModal] = useState<Lead | null>(null);
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Bulk action busy state
  const [bulkBusy, setBulkBusy] = useState(false);

  const PAGE_SIZE = 200;

  const fetchLeads = useCallback(
    async (
      s = search,
      st = statusFilter,
      tp = typeFilter,
      dr = dateRangeFilter
    ): Promise<Lead[] | null> => {
      try {
        setIsRefreshing(true);
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", "0");
        if (s.trim()) params.set("search", s.trim());
        if (st && st !== "hammasi") params.set("status", st);
        if (tp && tp !== "hammasi") params.set("type", tp);
        if (dr && dr !== "hammasi") params.set("dateRange", dr);

        const res = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" });
        if (res.status === 401) return null;
        const data = await res.json();
        if (data?.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
          setTotal(typeof data.total === "number" ? data.total : data.leads.length);
          setHasMore(Boolean(data.hasMore));
          if (data.stats) {
            setStats(data.stats);
          }
          setLastRefreshed(new Date());
          return data.leads;
        }
        return null;
      } catch {
        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [search, statusFilter, typeFilter, dateRangeFilter]
  );

  /** Keyingi sahifani yuklash */
  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(leads.length));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "hammasi") params.set("status", statusFilter);
      if (typeFilter && typeFilter !== "hammasi") params.set("type", typeFilter);
      if (dateRangeFilter && dateRangeFilter !== "hammasi") params.set("dateRange", dateRangeFilter);

      const res = await fetch(`/api/leads?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.leads)) {
        setLeads((prev) => [...prev, ...data.leads]);
        setHasMore(Boolean(data.hasMore));
        if (typeof data.total === "number") setTotal(data.total);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      setNotice("Keyingi arizalarni yuklab bo'lmadi");
    } finally {
      setLoadingMore(false);
    }
  }, [leads.length, search, statusFilter, typeFilter, dateRangeFilter]);

  // Local (offline) to'plangan arizalarni serverga ko'chirish
  const migrateLocalLeads = useCallback(
    async (currentLeads?: Lead[]) => {
      const local = getLocalLeads();
      if (local.length === 0) return;
      const baseList = currentLeads ?? leads;
      let migrated = 0;
      const remaining: typeof local = [];
      for (const l of local) {
        const exists = baseList.some(
          (s) => s.phone === l.phone && s.targetInterest === l.targetInterest && s.name === l.name
        );
        if (exists) continue;
        let ok = false;
        try {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": `migrate_${l.id}`,
            },
            body: JSON.stringify({
              name: l.name,
              phone: l.phone,
              type: l.type,
              targetInterest: l.targetInterest,
              preferredTime: l.preferredTime,
              notes: l.notes ? `${l.notes} (offline saqlangan edi)` : "Offline (lokal) saqlangan edi",
              source: "Admin — offline migratsiya",
            }),
          });
          ok = res.ok;
          if (res.status === 429) {
            remaining.push(l, ...local.slice(local.indexOf(l) + 1));
            break;
          }
        } catch {
          ok = false;
        }
        if (ok) migrated++;
        else remaining.push(l);
      }

      if (remaining.length > 0) {
        localStorage.setItem(LEADS_LOCAL_KEY, encryptStorage(remaining));
      } else {
        localStorage.removeItem(LEADS_LOCAL_KEY);
      }
      if (migrated > 0) {
        setNotice(
          `${migrated} ta qurilmada (offline) saqlangan ariza serverga ko'chirildi.` +
            (remaining.length ? ` ${remaining.length} tasi keyinroq ko'chiriladi.` : "")
        );
        fetchLeads();
      } else if (remaining.length > 0) {
        setNotice(`${remaining.length} ta offline arizani ko'chirib bo'lmadi — keyinroq qayta urinamiz.`);
      }
    },
    [leads, fetchLeads]
  );

  useEffect(() => {
    (async () => {
      const freshLeads = await fetchLeads("", "hammasi", "hammasi", "hammasi");
      if (freshLeads) {
        setAuthState("tayyor");
      } else {
        setAuthState("login");
      }
    })();
  }, [fetchLeads]);

  useEffect(() => {
    if (authState !== "tayyor") return;
    const timer = setTimeout(() => {
      fetchLeads(search, statusFilter, typeFilter, dateRangeFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter, dateRangeFilter, authState, fetchLeads]);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleSecondsLeft(null);
  }, []);

  const handleLogout = useCallback(async (reason?: "inactivity" | "manual") => {
    await fetch("/api/leads/logout", { method: "POST" }).catch(() => null);
    setAuthState("login");
    setLeads([]);
    setSelectedIds(new Set());
    setIdleSecondsLeft(null);
    if (reason === "inactivity") {
      setLoginError(
        "Xavfsizlik yuzasidan: 15 daqiqa davomida hech qanday harakat bo'lmagani sababli sessiya avtomatik yakunlandi. Davom etish uchun parolni qayta kiriting."
      );
    }
  }, []);

  // Harakatsizlikni (inactivity) kuzatuvchi va avtomatik chiquvchi taymer (15 daqiqa)
  useEffect(() => {
    if (authState !== "tayyor") {
      setIdleSecondsLeft(null);
      return;
    }

    lastActivityRef.current = Date.now();

    const handleUserActivity = () => {
      // Agar ogohlantirish oynasi ochiq bo'lmasa, harakat taymerni yangilaydi
      if (idleSecondsLeft === null) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "wheel"] as const;
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = IDLE_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        handleLogout("inactivity");
      } else if (remaining <= IDLE_WARNING_MS) {
        setIdleSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setIdleSecondsLeft(null);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [authState, handleLogout, idleSecondsLeft]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, rememberMe }),
      });
      if (res.ok) {
        setPassword("");
        const freshLeads = await fetchLeads();
        if (freshLeads) {
          setAuthState("tayyor");
          migrateLocalLeads(freshLeads);
        } else {
          setLoginError(
            "Kirish muvaffaqiyatli, ammo arizalarni yuklab bo'lmadi. Sahifani yangilab qayta urinib ko'ring."
          );
        }
      } else {
        const data = await res.json().catch(() => null);
        setLoginError(data?.error || "Parol noto'g'ri");
      }
    } catch {
      setLoginError("Serverga ulanish imkoni bo'lmadi");
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (id: string, newStatus: LeadStatus) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    if (activeLeadModal && activeLeadModal.id === id) {
      setActiveLeadModal((prevModal) => (prevModal ? { ...prevModal, status: newStatus } : null));
    }
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        setLeads(prev);
        if (res.status === 401) {
          setAuthState("login");
          setLoginError("Sessiya muddati tugadi — qaytadan kiring.");
          return;
        }
        const data = await res.json().catch(() => null);
        setNotice(data?.error || "Status yangilanmadi");
      } else {
        // Yangilangan statistika uchun foniy yuklash
        fetchLeads();
      }
    } catch {
      setLeads(prev);
      setNotice("Server bilan aloqa yo'qoldi");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Ushbu arizani o'chirmoqchimisiz?")) return;
    const prev = leads;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setSelectedIds((prevIds) => {
      const next = new Set(prevIds);
      next.delete(id);
      return next;
    });
    if (activeLeadModal && activeLeadModal.id === id) {
      setActiveLeadModal(null);
    }
    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        setLeads(prev);
        if (res.status === 401) {
          setAuthState("login");
          setLoginError("Sessiya muddati tugadi — qaytadan kiring.");
          return;
        }
        setNotice("Ariza o'chirilmadi");
      } else {
        fetchLeads();
      }
    } catch {
      setLeads(prev);
      setNotice("Server bilan aloqa yo'qoldi");
    }
  };

  // ─────────────────────────── To'plam (Batch) amallar ───────────────────────────
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchStatusUpdate = async (newStatus: LeadStatus) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: newStatus }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setNotice(`${ids.length} ta ariza holati "${STATUS_LABELS[newStatus]}" ga o'zgartirildi.`);
        setSelectedIds(new Set());
        fetchLeads();
      } else {
        setNotice(data?.error || "Arizalarni o'zgartirib bo'lmadi");
      }
    } catch {
      setNotice("Server bilan aloqa yo'qoldi");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Haqiqatan ham tanlangan ${selectedIds.size} ta arizani o'chirmoqchimisiz?`)) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    try {
      const res = await fetch(`/api/leads?ids=${encodeURIComponent(ids.join(","))}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setNotice(`${ids.length} ta ariza bazadan muvaffaqiyatli o'chirildi.`);
        setSelectedIds(new Set());
        fetchLeads();
      } else {
        setNotice(data?.error || "Arizalarni o'chirib bo'lmadi");
      }
    } catch {
      setNotice("Server bilan aloqa yo'qoldi");
    } finally {
      setBulkBusy(false);
    }
  };

  // ─────────────────────────── Lead Details & Admin Notes ───────────────────────────
  const openLeadModal = (lead: Lead) => {
    setActiveLeadModal(lead);
    setModalAdminNotes(lead.adminNotes || "");
  };

  const closeLeadModal = () => {
    setActiveLeadModal(null);
    setModalAdminNotes("");
  };

  const handleSaveAdminNotes = async () => {
    if (!activeLeadModal) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeLeadModal.id,
          adminNotes: modalAdminNotes.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === activeLeadModal.id ? { ...l, adminNotes: modalAdminNotes.trim() } : l
          )
        );
        setActiveLeadModal((prev) =>
          prev ? { ...prev, adminNotes: modalAdminNotes.trim() } : null
        );
        setNotice("Admin qaydi muvaffaqiyatli saqlandi.");
      } else {
        setNotice(data?.error || "Qaydni saqlab bo'lmadi");
      }
    } catch {
      setNotice("Server bilan aloqa uzildi");
    } finally {
      setSavingNotes(false);
    }
  };

  // Mijozlar ro'yxatini filtrlash
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.trim().toLowerCase();
      const searchDigits = search.replace(/\D/g, "");
      const matchPhone =
        searchDigits.length > 0 && l.phone.replace(/\D/g, "").includes(searchDigits);
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        matchPhone ||
        l.targetInterest.toLowerCase().includes(q) ||
        (l.notes ? l.notes.toLowerCase().includes(q) : false) ||
        (l.adminNotes ? l.adminNotes.toLowerCase().includes(q) : false);

      const matchStatus = statusFilter === "hammasi" || l.status === statusFilter;
      const matchType = typeFilter === "hammasi" || l.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [leads, search, statusFilter, typeFilter]);

  const exportCSV = () => {
    const headers =
      "ID,Ism,Telefon,Turi,Yo'nalish,Qulay_Vaqt,Manba,Yaratilgan_Sana,Status,Mijoz_Izohi,Admin_Qaydi\n";
    const rows = filteredLeads
      .map((l) =>
        [
          sanitizeCsvField(l.id),
          sanitizeCsvField(l.name),
          sanitizeCsvField(l.phone),
          sanitizeCsvField(l.type),
          sanitizeCsvField(l.targetInterest),
          sanitizeCsvField(l.preferredTime || "—"),
          sanitizeCsvField(l.source || "sayt"),
          sanitizeCsvField(l.createdAt),
          sanitizeCsvField(STATUS_LABELS[l.status] ?? l.status),
          sanitizeCsvField(l.notes),
          sanitizeCsvField(l.adminNotes),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algoritm_arizalar_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const typeLabel = (t: LeadType) =>
    t === "maktab" ? "Maktab" : t === "kurs" ? "O'quv Markazi" : "Umumiy";

  // Telegram raqam formatlash: 998901234567
  const formatTelegramUrl = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, "");
    return `https://t.me/+${digits}`;
  };

  // --- Login ekrani ---
  if (authState === "login") {
    return (
      <div className="flex flex-col min-h-screen bg-night text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-10 text-center space-y-5 shadow-2xl backdrop-blur-md"
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white">CRM Portalga Kirish</h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Algoritm tizimidagi barcha arizalar va murojaatlarni boshqarish uchun maxfiy parolni kiriting.
              </p>
            </div>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin paroli"
              className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-center tracking-widest transition"
            />
            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {loginError}
              </p>
            )}
            <label className="flex items-center justify-between gap-3 text-left p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition select-none">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">Ushbu qurilmada eslab qolish (7 kun)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {rememberMe ? "Doimiy" : "Sessiya"}
              </span>
            </label>
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Boshqaruvga Kirish
            </button>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Xavfsizlik: Eslab qolish belgilanmasa, brauzer yopilganda avtomatik chiqiladi. Harakatsizlikda 15 daqiqada avto-logout faol.
            </p>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  if (authState === "tekshirilmoqda") {
    return (
      <div className="flex flex-col min-h-screen bg-night text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-9 h-9 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">CRM yuklanmoqda...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-night text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Yuqori sarlavha va asosiy tugmalar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-500 text-xs font-bold uppercase tracking-wider border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> CRM Boshqaruvi
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {total} ta jami ariza
                {leads.length < total ? ` · ${leads.length} tasi ko'rinmoqda` : ""}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Oxirgi yangilanish: {lastRefreshed.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-[11px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                15 daqiqali avto-himoya faol
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Arizalar va Qabul CRM Tizimi
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Jonli yangilash tugmasi */}
            <button
              onClick={() => fetchLeads()}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
              title="Ro'yxatni yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </button>

            {/* CSV Eksport */}
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-2 shadow-sm"
              title="Filtrlangan arizalarni Excel/CSV formatida yuklab olish"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" /> Excel / CSV ({filteredLeads.length})
            </button>

            {/* Chiqish */}
            <button
              onClick={() => handleLogout("manual")}
              className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Chiqish
            </button>
          </div>
        </div>

        {/* ─────────────────────────── Executive KPI Cards ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-7">
          {/* Card 1: Jami arizalar */}
          <button
            onClick={() => {
              setStatusFilter("hammasi");
              setDateRangeFilter("hammasi");
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              statusFilter === "hammasi" && dateRangeFilter === "hammasi"
                ? "bg-white/10 border-brand-500/60 ring-1 ring-brand-500/40 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Jami Arizalar</span>
              <Users className="w-4 h-4 text-brand-500 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
              {stats?.total ?? total}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Barcha tushgan murojaatlar</p>
          </button>

          {/* Card 2: Yangi (Kutilmoqda) */}
          <button
            onClick={() => {
              setStatusFilter("yangi");
              setDateRangeFilter("hammasi");
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              statusFilter === "yangi"
                ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                Yangi
              </span>
              <Clock className="w-4 h-4 text-amber-400 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-amber-300 mt-1">
              {stats?.yangi ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Aloqaga chiqilishi kerak</p>
          </button>

          {/* Card 3: Bog'lanildi */}
          <button
            onClick={() => {
              setStatusFilter("boglangan");
              setDateRangeFilter("hammasi");
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              statusFilter === "boglangan"
                ? "bg-sky-500/10 border-sky-500/60 ring-1 ring-sky-500/40 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-sky-500/30 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">Bog'lanildi</span>
              <PhoneCall className="w-4 h-4 text-sky-400 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-sky-300 mt-1">
              {stats?.boglangan ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Suhbat o'tkazilgan</p>
          </button>

          {/* Card 4: Qabul qilindi */}
          <button
            onClick={() => {
              setStatusFilter("qabul_qilindi");
              setDateRangeFilter("hammasi");
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              statusFilter === "qabul_qilindi"
                ? "bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Qabul qilindi</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-emerald-300 mt-1">
              {stats?.qabul_qilindi ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">O'qishga yozildi</p>
          </button>

          {/* Card 5: Bugungi arizalar */}
          <button
            onClick={() => {
              setDateRangeFilter("bugun");
              setStatusFilter("hammasi");
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden col-span-2 sm:col-span-1 ${
              dateRangeFilter === "bugun"
                ? "bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-500/40 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">Bugun tushgan</span>
              <Sparkles className="w-4 h-4 text-purple-400 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-purple-300 mt-1">
              {stats?.todayCount ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Bugun kelgan yangi murojaatlar</p>
          </button>
        </div>

        {/* Xabar/Bildirishnoma paneli */}
        {notice && (
          <div className="mb-6 flex items-start gap-2.5 text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-2xl px-4 py-3 animate-fade-in">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand-400" />
            <span className="flex-1">{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="text-brand-300 hover:text-white font-bold p-0.5 ml-2"
              title="Yopish"
            >
              ✕
            </button>
          </div>
        )}

        {/* ─────────────────────────── Filtrlash va Qidiruv Paneli ─────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3.5">
          {/* Sana oralig'i tugmalari (Date range pills) */}
          <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Sana oralig'i:
            </span>
            {(
              [
                { value: "hammasi", label: "Barchasi" },
                { value: "bugun", label: "Bugun" },
                { value: "hafta", label: "Oxirgi 7 kun" },
                { value: "oy", label: "Shu oy" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRangeFilter(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  dateRangeFilter === opt.value
                    ? "bg-brand-500 text-slate-950 shadow-md font-bold"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Qidiruv, Yo'nalish va Status filtrlari */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Qidiruv maydoni */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ism, telefon, yo'nalish yoki qayd bo'yicha qidiruv..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                  title="Qidiruvni tozalash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Yo'nalish turi */}
            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500 transition cursor-pointer"
              >
                <option value="hammasi" className="bg-slate-900">Barcha Yo'nalishlar</option>
                <option value="maktab" className="bg-slate-900">Algoritm Maktabi</option>
                <option value="kurs" className="bg-slate-900">O'quv Markazi Kurslari</option>
                <option value="umumiy" className="bg-slate-900">Umumiy Konsultatsiya</option>
              </select>
            </div>

            {/* Status filtri */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500 transition cursor-pointer"
              >
                <option value="hammasi" className="bg-slate-900">Barcha Statuslar</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-slate-900">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─────────────────────────── To'plam (Batch) amallar paneli ─────────────────────────── */}
        {selectedIds.size > 0 && (
          <div className="mb-4 sticky top-20 z-20 rounded-2xl bg-slate-900/95 border border-brand-500/40 p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-500 text-slate-950 flex items-center justify-center font-black text-xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-semibold text-white">
                ta ariza tanlandi
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-slate-400 hover:text-white underline ml-2"
              >
                Tanlovni bekor qilish
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Statusni o'zgartirish:</span>
              <button
                disabled={bulkBusy}
                onClick={() => handleBatchStatusUpdate("boglangan")}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition disabled:opacity-50"
              >
                Bog'lanildi
              </button>
              <button
                disabled={bulkBusy}
                onClick={() => handleBatchStatusUpdate("qabul_qilindi")}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition disabled:opacity-50"
              >
                Qabul qilindi
              </button>
              <button
                disabled={bulkBusy}
                onClick={() => handleBatchStatusUpdate("bekor_qilindi")}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition disabled:opacity-50"
              >
                Bekor qilindi
              </button>
              <button
                disabled={bulkBusy}
                onClick={handleBatchDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-xs font-bold border border-rose-500/40 transition flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Tanlanganlarni o'chirish
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────── Desktop Jadval (Table View) ─────────────────────────── */}
        <div className="hidden md:block rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredLeads.length > 0 &&
                        filteredLeads.every((l) => selectedIds.has(l.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded border-white/20 bg-white/5 text-brand-500 focus:ring-0 cursor-pointer"
                      title="Barchasini tanlash"
                    />
                  </th>
                  <th className="py-4 px-5">Murojaatchi</th>
                  <th className="py-4 px-5">Aloqa (Tel / TG)</th>
                  <th className="py-4 px-5">Yo'nalish</th>
                  <th className="py-4 px-5">Sana</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Admin Qaydi</th>
                  <th className="py-4 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-500" />
                      <p className="text-sm font-semibold">Hech qanday ariza topilmadi.</p>
                      <p className="text-xs text-slate-500 mt-1">Qidiruv yoki filtrlarni o'zgartirib ko'ring.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`transition ${
                          isSelected ? "bg-brand-500/10" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(lead.id)}
                            className="rounded border-white/20 bg-white/5 text-brand-500 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Ism va Mijoz Izohi */}
                        <td className="py-4 px-5 font-bold text-white">
                          <div
                            onClick={() => openLeadModal(lead)}
                            className="cursor-pointer hover:text-brand-400 transition"
                          >
                            <span>{lead.name}</span>
                            {lead.notes && (
                              <span
                                className="block text-[10px] text-slate-400 font-normal mt-0.5 max-w-[200px] truncate"
                                title={lead.notes}
                              >
                                {lead.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Telefon va Telegram tezkor havola */}
                        <td className="py-4 px-5 font-mono text-slate-300">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:+${lead.phone.replace(/\D/g, "")}`}
                              className="hover:text-brand-400 transition flex items-center gap-1 font-semibold"
                              title="Qo'ng'iroq qilish"
                            >
                              <Phone className="w-3 h-3 text-brand-500" />
                              {lead.phone}
                            </a>
                            <a
                              href={formatTelegramUrl(lead.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 transition"
                              title="Telegramda yozish"
                            >
                              <Send className="w-3 h-3" />
                            </a>
                          </div>
                        </td>

                        {/* Yo'nalish va Kurs */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.type === "maktab"
                                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                : lead.type === "kurs"
                                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                                  : "bg-white/10 text-slate-300 border border-white/15"
                            }`}
                          >
                            {typeLabel(lead.type)} — {lead.targetInterest}
                          </span>
                        </td>

                        {/* Sana */}
                        <td className="py-4 px-5 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleString("uz-UZ", {
                            timeZone: "Asia/Tashkent",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Status tanlash */}
                        <td className="py-4 px-5">
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold focus:outline-none border bg-transparent cursor-pointer ${
                              lead.status === "yangi"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : lead.status === "boglangan"
                                  ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                  : lead.status === "qabul_qilindi"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value} className="bg-slate-900 text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Admin qaydi ustuni */}
                        <td className="py-4 px-5">
                          {lead.adminNotes ? (
                            <button
                              onClick={() => openLeadModal(lead)}
                              className="text-left text-[11px] text-amber-300 hover:text-amber-200 max-w-[150px] truncate block font-medium"
                              title={lead.adminNotes}
                            >
                              ✍️ {lead.adminNotes}
                            </button>
                          ) : (
                            <button
                              onClick={() => openLeadModal(lead)}
                              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Qayd qo'shish
                            </button>
                          )}
                        </td>

                        {/* Amallar: Batafsil va O'chirish */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openLeadModal(lead)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold transition border border-white/10"
                              title="Batafsil ma'lumot va izoh yozish"
                            >
                              Batafsil
                            </button>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="O'chirish"
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

          {hasMore && (
            <div className="border-t border-white/10 p-4 text-center bg-white/[0.02]">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full bg-white/10 px-6 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                {loadingMore ? "Yuklanmoqda..." : `Yana ${PAGE_SIZE} ta arizani yuklash`}
              </button>
            </div>
          )}
        </div>

        {/* ─────────────────────────── Mobile Kartochkalar (Mobile Cards View) ─────────────────────────── */}
        <div className="block md:hidden space-y-3.5">
          {filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-white/5 rounded-3xl border border-white/10 p-6">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="text-sm font-semibold">Hech qanday ariza topilmadi.</p>
              <p className="text-xs text-slate-500 mt-1">Filtrlarni o'zgartirib ko'ring.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "bg-brand-500/10 border-brand-500/50"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(lead.id)}
                        className="rounded border-white/20 bg-white/5 text-brand-500 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <div>
                        <h3 className="font-bold text-white text-sm">{lead.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(lead.createdAt).toLocaleString("uz-UZ", {
                            timeZone: "Asia/Tashkent",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold focus:outline-none border bg-transparent cursor-pointer ${
                        lead.status === "yangi"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : lead.status === "boglangan"
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                            : lead.status === "qabul_qilindi"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value} className="bg-slate-900 text-white">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Yo'nalish */}
                  <div className="mb-2.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.type === "maktab"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : lead.type === "kurs"
                            ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                            : "bg-white/10 text-slate-300 border border-white/15"
                      }`}
                    >
                      {typeLabel(lead.type)} — {lead.targetInterest}
                    </span>
                  </div>

                  {/* Aloqa tugmalari */}
                  <div className="flex items-center gap-2 mb-3">
                    <a
                      href={`tel:+${lead.phone.replace(/\D/g, "")}`}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-500" />
                      {lead.phone}
                    </a>
                    <a
                      href={formatTelegramUrl(lead.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  </div>

                  {/* Izoh yoki Admin qaydi */}
                  {(lead.notes || lead.adminNotes) && (
                    <div className="mb-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] space-y-1">
                      {lead.notes && (
                        <p className="text-slate-400">
                          <span className="text-slate-500 font-semibold">Mijoz:</span> {lead.notes}
                        </p>
                      )}
                      {lead.adminNotes && (
                        <p className="text-amber-300">
                          <span className="text-amber-400 font-semibold">Admin qaydi:</span> {lead.adminNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Amallar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <button
                      onClick={() => openLeadModal(lead)}
                      className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                    >
                      Batafsil / Qayd yozish <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full rounded-2xl bg-white/10 py-3 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                {loadingMore ? "Yuklanmoqda..." : `Yana ${PAGE_SIZE} ta arizani yuklash`}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ─────────────────────────── Lead Details & Admin Notes Modal ─────────────────────────── */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal sarlavhasi */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-500 text-[10px] font-bold uppercase tracking-wider border border-brand-500/30">
                  {typeLabel(activeLeadModal.type)}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{activeLeadModal.name}</h2>
                <p className="text-[11px] text-slate-400 font-mono">ID: {activeLeadModal.id}</p>
              </div>
              <button
                onClick={closeLeadModal}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Asosiy ma'lumotlar tarmog'i */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Telefon</span>
                <div className="mt-1 flex items-center gap-1.5 font-mono font-bold text-white">
                  <a href={`tel:+${activeLeadModal.phone.replace(/\D/g, "")}`} className="hover:text-brand-400">
                    {activeLeadModal.phone}
                  </a>
                  <a
                    href={formatTelegramUrl(activeLeadModal.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 ml-1"
                    title="Telegramda ochish"
                  >
                    <Send className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Tanlangan Kurs</span>
                <div className="mt-1 font-bold text-white truncate" title={activeLeadModal.targetInterest}>
                  {activeLeadModal.targetInterest}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Qulay Vaqt</span>
                <div className="mt-1 text-slate-200">
                  {activeLeadModal.preferredTime || "Belgilanmagan"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Manba</span>
                <div className="mt-1 text-slate-300 truncate" title={activeLeadModal.source}>
                  {activeLeadModal.source || "Sayt"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ariza Berilgan Vaqt</span>
                <div className="mt-1 font-mono text-slate-200">
                  {new Date(activeLeadModal.createdAt).toLocaleString("uz-UZ", {
                    timeZone: "Asia/Tashkent",
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Mijoz izohi (agar bo'lsa) */}
            {activeLeadModal.notes && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">
                  Mijoz qoldirgan izoh
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  "{activeLeadModal.notes}"
                </p>
              </div>
            )}

            {/* Statusni o'zgartirish */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Ariza Holati (Status):</label>
              <select
                value={activeLeadModal.status}
                onChange={(e) => updateStatus(activeLeadModal.id, e.target.value as LeadStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-slate-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ichki Admin Qaydi (adminNotes) */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" /> Ichki Admin Qaydi (Xodimlar uchun):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {modalAdminNotes.length} / 600
                </span>
              </div>
              <textarea
                value={modalAdminNotes}
                onChange={(e) => setModalAdminNotes(e.target.value.slice(0, 600))}
                rows={4}
                placeholder="Mijoz bilan suhbat natijasi, sinov darsi vaqti yoki qo'shimcha kelishuvlar..."
                className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition leading-relaxed"
              />
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[10px] text-slate-500">
                  Ushbu qayd faqat admin va menejerlarga ko'rinadi.
                </p>
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveAdminNotes}
                  className="px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                >
                  {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                  Qaydni Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Harakatsizlik (Inactivity) Ogohlantirish Modali */}
      {idleSecondsLeft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 animate-pulse shadow-lg shadow-amber-500/20">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sessiya yakunlanmoqda</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                14 daqiqa davomida hech qanday faollik sezilmadi. Xavfsizlik yuzasidan sessiyangiz yana{" "}
                <span className="text-amber-400 font-black font-mono text-base px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  {idleSecondsLeft} soniya
                </span>{" "}
                dan so'ng avtomatik yopiladi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={extendSession}
                className="w-full sm:flex-1 py-3 px-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Sessiyani uzaytirish
              </button>
              <button
                type="button"
                onClick={() => handleLogout("manual")}
                className="w-full sm:w-auto py-3 px-4 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
