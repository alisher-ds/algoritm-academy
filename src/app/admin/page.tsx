"use client";

import React, { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  getLocalLeads,
  LEADS_LOCAL_KEY,
  type Lead,
  type LeadStatus,
  type LeadType,
} from "@/lib/leads";

type AuthState = "tekshirilmoqda" | "login" | "tayyor";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("tekshirilmoqda");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("hammasi");
  const [typeFilter, setTypeFilter] = useState<string>("hammasi");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 200;

  const fetchLeads = useCallback(
    async (s = search, st = statusFilter, tp = typeFilter): Promise<Lead[] | null> => {
      try {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", "0");
        if (s.trim()) params.set("search", s.trim());
        if (st && st !== "hammasi") params.set("status", st);
        if (tp && tp !== "hammasi") params.set("type", tp);

        const res = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" });
        if (res.status === 401) return null;
        const data = await res.json();
        if (data?.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
          setTotal(typeof data.total === "number" ? data.total : data.leads.length);
          setHasMore(Boolean(data.hasMore));
          return data.leads;
        }
        return null;
      } catch {
        return null;
      }
    },
    [search, statusFilter, typeFilter]
  );

  /** Keyingi sahifani yuklash — butun bazani bir yo'la tortmaslik uchun. */
  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(leads.length));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "hammasi") params.set("status", statusFilter);
      if (typeFilter && typeFilter !== "hammasi") params.set("type", typeFilter);

      const res = await fetch(`/api/leads?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.leads)) {
        setLeads((prev) => [...prev, ...data.leads]);
        setHasMore(Boolean(data.hasMore));
        if (typeof data.total === "number") setTotal(data.total);
      }
    } catch {
      setNotice("Keyingi arizalarni yuklab bo'lmadi");
    } finally {
      setLoadingMore(false);
    }
  }, [leads.length, search, statusFilter, typeFilter]);

  // Local (offline) to'plangan arizalarni serverga ko'chirish
  const migrateLocalLeads = useCallback(async (currentLeads?: Lead[]) => {
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
      // `submitLead()` ishlatilmaydi: u xatolikda arizani localStorage'ga QAYTA yozadi
      // va migratsiya paytida dublikat yaratadi. Bu yerda xom fetch yetarli.
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
          // Rate-limit — qolganlarini keyingi kirishda ko'chiramiz.
          remaining.push(l, ...local.slice(local.indexOf(l) + 1));
          break;
        }
      } catch {
        ok = false;
      }
      if (ok) migrated++;
      else remaining.push(l);
    }

    // `remaining` HAR DOIM yoziladi — ilgari faqat `migrated > 0` bo'lganda yozilardi
    // va muvaffaqiyatsiz migratsiyadan keyin dublikatlar qurilmada qolib ketardi.
    if (remaining.length > 0) {
      localStorage.setItem(LEADS_LOCAL_KEY, JSON.stringify(remaining));
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
  }, [leads, fetchLeads]);

  useEffect(() => {
    (async () => {
      const freshLeads = await fetchLeads("", "hammasi", "hammasi");
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
      fetchLeads(search, statusFilter, typeFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter, authState, fetchLeads]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        const freshLeads = await fetchLeads();
        if (freshLeads) {
          setAuthState("tayyor");
          migrateLocalLeads(freshLeads);
        } else {
          // Parol to'g'ri edi, lekin ro'yxatni olib bo'lmadi. Buni aytmasak
          // foydalanuvchi "parolim ishlamayapti" deb o'ylab qoladi.
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

  const handleLogout = async () => {
    await fetch("/api/leads/logout", { method: "POST" }).catch(() => null);
    setAuthState("login");
    setLeads([]);
  };

  const updateStatus = async (id: string, newStatus: LeadStatus) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
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
      }
    } catch {
      setLeads(prev);
      setNotice("Server bilan aloqa yo'qoldi");
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = search.trim().toLowerCase();
    const searchDigits = search.replace(/\D/g, "");
    const matchPhone =
      searchDigits.length > 0 && l.phone.replace(/\D/g, "").includes(searchDigits);
    const matchSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      matchPhone ||
      l.targetInterest.toLowerCase().includes(q) ||
      (l.notes ? l.notes.toLowerCase().includes(q) : false);
    const matchStatus = statusFilter === "hammasi" || l.status === statusFilter;
    const matchType = typeFilter === "hammasi" || l.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // CSV katakchasi: qo'shtirnoqlarni ekranlash + formula injection (=,+,-,@) himoyasi.
  const csvCell = (value: string | undefined) => {
    const raw = (value ?? "").replace(/\r?\n/g, " ");
    const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const headers = "ID,Ism,Telefon,Turi,Yo'nalish,Sana,Status,Izoh,Admin_Qaydi\n";
    const rows = filteredLeads
      .map((l) =>
        [
          csvCell(l.id),
          csvCell(l.name),
          csvCell(l.phone),
          csvCell(l.type),
          csvCell(l.targetInterest),
          csvCell(l.createdAt),
          csvCell(STATUS_LABELS[l.status] ?? l.status),
          csvCell(l.notes),
          csvCell(l.adminNotes),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algoritm_arizalar_${new Date().toISOString().slice(0, 10)}.csv`;
    // Firefox link DOM'da bo'lishini talab qiladi; URL'ni darhol bekor qilish esa
    // ba'zi brauzerlarda yuklab olish boshlanmasdan uni uzib qo'yadi.
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const typeLabel = (t: LeadType) =>
    t === "maktab" ? "Maktab" : t === "kurs" ? "O'quv Markazi" : "Umumiy";

  // --- Login ekrani ---
  if (authState === "login") {
    return (
      <div className="flex flex-col min-h-screen bg-night text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-10 text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white">CRM Kirish</h1>
              <p className="text-xs text-slate-400 mt-1">
                Arizalar boshqaruviga kirish uchun parolni kiriting.
              </p>
            </div>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Maxfiy parol"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-center"
            />
            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Kirish
            </button>
            <p className="text-[10px] text-slate-500">
              Parol serverda <code className="text-slate-400">ADMIN_PASSWORD</code> env orqali o'rnatiladi.
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
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-night text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-500 text-xs font-bold uppercase tracking-wider border border-brand-500/30">
                CRM Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {total} ta jami ariza
                {leads.length < total ? ` · ${leads.length} tasi yuklangan` : ""}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white mt-2">
              Arizalar va Qabul Boshqaruvi
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportCSV}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-2 self-start md:self-auto"
            >
              <Download className="w-4 h-4 text-brand-500" /> Excel / CSV Eksport ({filteredLeads.length})
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-white/10 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Chiqish
            </button>
          </div>
        </div>

        {notice && (
          <div className="mb-6 flex items-start gap-2 text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-2xl px-4 py-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="ml-auto text-brand-300 hover:text-white font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon yoki kurs bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="hammasi" className="bg-slate-900">Barcha Yo'nalishlar</option>
            <option value="maktab" className="bg-slate-900">Algoritm Maktabi</option>
            <option value="kurs" className="bg-slate-900">O'quv Markazi Kurslari</option>
            <option value="umumiy" className="bg-slate-900">Umumiy Konsultatsiya</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="hammasi" className="bg-slate-900">Barcha Statuslar</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-900">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">O'quvchi / Ota-ona</th>
                  <th className="py-4 px-6">Telefon</th>
                  <th className="py-4 px-6">Yo'nalish</th>
                  <th className="py-4 px-6">Manba</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Hech qanday ariza topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-6 font-bold text-white">
                        {lead.name}
                        {lead.notes && (
                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5 max-w-[220px] truncate" title={lead.notes}>
                            {lead.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        <a
                          href={`tel:+${lead.phone.replace(/\D/g, "")}`}
                          className="hover:text-brand-500 transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-brand-500" /> {lead.phone}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                      <td className="py-4 px-6 text-slate-500 text-[10px] font-medium max-w-[140px] truncate" title={lead.source}>
                        {lead.source || "—"}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-[11px] font-mono">
                        {new Date(lead.createdAt).toLocaleString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold focus:outline-none border bg-transparent cursor-pointer ${
                            lead.status === "yangi"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : lead.status === "boglangan"
                                ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                                : lead.status === "qabul_qilindi"
                                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-slate-900">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="border-t border-white/10 p-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full bg-white/10 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                {loadingMore ? "Yuklanmoqda..." : `Yana ${PAGE_SIZE} ta yuklash`}
              </button>
              <p className="mt-2 text-[11px] text-slate-500">
                CSV eksport faqat yuklangan arizalarni oladi.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
