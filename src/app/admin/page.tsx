"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Users, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calendar,
  Sparkles,
  Download
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface Lead {
  id: string;
  name: string;
  phone: string;
  type: "maktab" | "kurs" | "umumiy";
  interest: string;
  note?: string;
  date: string;
  status: "yangi" | "bog'lanildi" | "to'lov_qildi" | "bekor";
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("hammasi");
  const [typeFilter, setTypeFilter] = useState<string>("hammasi");

  useEffect(() => {
    // Load leads from localStorage
    try {
      const stored = localStorage.getItem("algoritm_crm_leads");
      if (stored) {
        setLeads(JSON.parse(stored));
      } else {
        // Initial real samples from the Qarshi campaigns
        const initialLeads: Lead[] = [
          {
            id: "lead_1",
            name: "Sardorbek Rahimov",
            phone: "+998 99 123 45 67",
            type: "maktab",
            interest: "5-sinf Matematika (O'zbek sinfi)",
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "yangi",
          },
          {
            id: "lead_2",
            name: "Nilufar Qosimova",
            phone: "+998 90 765 43 21",
            type: "kurs",
            interest: "Prezident Maktabiga Tayyorlov (PMT)",
            date: new Date(Date.now() - 3600000 * 5).toISOString(),
            status: "bog'lanildi",
          },
          {
            id: "lead_3",
            name: "Shaxzod Aliyev",
            phone: "+998 94 333 22 11",
            type: "kurs",
            interest: "SAT Kashkadarya & IELTS 7.5+",
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "to'lov_qildi",
          },
          {
            id: "lead_4",
            name: "Kamola Umarova",
            phone: "+998 91 456 78 90",
            type: "maktab",
            interest: "1-sinf Rus tili guruhi & Yotoqxona",
            date: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: "yangi",
          },
        ];
        localStorage.setItem("algoritm_crm_leads", JSON.stringify(initialLeads));
        setLeads(initialLeads);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateStatus = (id: string, newStatus: Lead["status"]) => {
    const updated = leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
    setLeads(updated);
    localStorage.setItem("algoritm_crm_leads", JSON.stringify(updated));
  };

  const deleteLead = (id: string) => {
    if (confirm("Ushbu arizani o'chirmoqchimisiz?")) {
      const updated = leads.filter((l) => l.id !== id);
      setLeads(updated);
      localStorage.setItem("algoritm_crm_leads", JSON.stringify(updated));
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.interest.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "hammasi" || l.status === statusFilter;
    const matchType = typeFilter === "hammasi" || l.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const exportCSV = () => {
    const headers = "ID,Ism,Telefon,Turi,Qiziqish,Sana,Status\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.phone}","${l.type}","${l.interest}","${l.date}","${l.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algoritm_arizalar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1329] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand/15 text-brand text-xs font-bold uppercase tracking-wider border border-brand/30">
                CRM Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {leads.length} ta jami ariza
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase text-white mt-2">
              Arizalar va Qabul Boshqaruvi
            </h1>
          </div>

          <button
            onClick={exportCSV}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-brand" /> Excel / CSV Eksport
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon yoki kurs bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand"
            >
              <option value="hammasi" className="bg-slate-900">Barcha Yo'nalishlar</option>
              <option value="maktab" className="bg-slate-900">Algoritm Maktabi</option>
              <option value="kurs" className="bg-slate-900">O'quv Markazi Kurslari</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand"
            >
              <option value="hammasi" className="bg-slate-900">Barcha Statuslar</option>
              <option value="yangi" className="bg-slate-900">Yangi</option>
              <option value="bog'lanildi" className="bg-slate-900">Bog'lanildi</option>
              <option value="to'lov_qildi" className="bg-slate-900">To'lov Qildi / Qabul</option>
              <option value="bekor" className="bg-slate-900">Bekor Qilindi</option>
            </select>
          </div>
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
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Hech qanday ariza topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-6 font-bold text-white">
                        {lead.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        <a href={`tel:${lead.phone}`} className="hover:text-brand transition flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand" /> {lead.phone}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          lead.type === "maktab"
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : "bg-brand/20 text-brand border border-brand/30"
                        }`}>
                          {lead.interest}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-[11px] font-mono">
                        {new Date(lead.date).toLocaleString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold focus:outline-none border ${
                            lead.status === "yangi"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : lead.status === "bog'lanildi"
                              ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                              : lead.status === "to'lov_qildi"
                              ? "bg-brand/20 text-brand border border-brand/30"
                              : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          <option value="yangi" className="bg-slate-900">Yangi</option>
                          <option value="bog'lanildi" className="bg-slate-900">Bog'lanildi</option>
                          <option value="to'lov_qildi" className="bg-slate-900">Qabul Qilindi</option>
                          <option value="bekor" className="bg-slate-900">Bekor</option>
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
