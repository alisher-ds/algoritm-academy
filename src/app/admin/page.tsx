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
  submitLead,
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

  const fetchLeads = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (res.status === 401) return false;
      const data = await res.json();
      if (data?.success) {
        setLeads(data.leads);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Local (offline) to'plangan arizalarni serverga ko'chirish
  const migrateLocalLeads = useCallback(async () => {
    const local = getLocalLeads();
    if (local.length === 0) return;
    let migrated = 0;
    for (const l of local) {
      const exists = leads.some(
        (s) => s.phone === l.phone && s.targetInterest === l.targetInterest && s.name === l.name
      );
      if (exists) continue;
      const res = await submitLead({
        name: l.name,
        phone: l.phone,
        type: l.type,
        targetInterest: l.targetInterest,
        preferredTime: l.preferredTime,
        notes: l.notes ? `${l.notes} (offline saqlangan edi)` : "Offline (lokal) saqlangan edi",
        source: "Admin — offline migratsiya",
      });
      if (res.ok) migrated++;
    }
    if (migrated > 0) {
      setNotice(`${migrated} ta qurilmada (offline) saqlangan ariza serverga ko'chirildi.`);
      localStorage.removeItem(LEADS_LOCAL_KEY);
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  useEffect(() => {
    (async () => {
      const ok = await fetchLeads();
      if (ok) {
        setAuthState("tayyor");
      } else {
        setAuthState("login");
      }
    })();
  }, [fetchLeads]);

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
        const ok = await fetchLeads();
        if (ok) {
          setAuthState("tayyor");
          migrateLocalLeads();
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
        setNotice("Ariza o'chirilmadi");
      }
    } catch {
      setLeads(prev);
      setNotice("Server bilan aloqa yo'qoldi");
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.replace(/\D/g, "").includes(search.replace(/\D/g, "")) ||
      l.targetInterest.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "hammasi" || l.status === statusFilter;
    const matchType = typeFilter === "hammasi" || l.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const exportCSV = () => {
    const headers = "ID,Ism,Telefon,Turi,Yo'nalish,Sana,Status,Izoh\n";
    const rows = leads
      .map((l) =>
        [
          l.id,
          `"${l.name}"`,
          `"${l.phone}"`,
          l.type,
          `"${l.targetInterest}"`,
          l.createdAt,
          STATUS_LABELS[l.status] ?? l.status,
          l.notes ? `"${l.notes}"` : "",
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algoritm_arizalar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
              <span className="text-xs text-slate-400 font-mono">{leads.length} ta jami ariza</span>
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
              <Download className="w-4 h-4 text-brand-500" /> Excel / CSV Eksport
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
                          href={`tel:${lead.phone.replace(/\D/g, "")}`}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
