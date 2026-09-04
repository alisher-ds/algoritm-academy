"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Phone, User, BookOpen, Send, Sparkles, Loader2 } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: string;
}

export default function LeadModal({
  isOpen,
  onClose,
  initialCourse = "Prezident Maktabiga Tayyorlov (PMT)",
}: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialCourse) setSelectedCourse(initialCourse);
  }, [initialCourse]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 9) return;

    setLoading(true);

    const newLead = {
      id: "lead_" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      interest: selectedCourse,
      date: new Date().toISOString(),
      status: "yangi",
    };

    try {
      const stored = localStorage.getItem("algoritm_crm_leads");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newLead);
      localStorage.setItem("algoritm_crm_leads", JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleClose = () => {
    setSubmitted(false);
    setName("");
    setPhone("+998");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1329] border border-white/20 p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mx-auto text-brand animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white">
              Arizangiz Qabul Qilindi!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Mutaxassislarimiz 15 daqiqa ichida siz bilan bog'lanib, bepul sinov darsiga taklif qilishadi.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-8 py-3 rounded-full bg-brand text-slate-950 font-bold text-xs hover:bg-brand-light transition"
            >
              Tushunarli
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand text-xs font-bold uppercase tracking-wider mb-2 border border-brand/30">
                <Sparkles className="w-3.5 h-3.5" /> 1-Dars Bepul Sinov Darsi
              </span>
              <h3 className="text-2xl font-black uppercase text-white">
                Kursga Ro'yxatdan O'tish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ismingiz va telefon raqamingizni qoldiring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Ism va Familiyangiz
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Jasur Rahimov"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Telefon Raqamingiz
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Qiziqtirayotgan Kurs
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-brand"
                >
                  {ECOSYSTEM_DATA.courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                  <option value="Boshqa yo'nalish">Boshqa yo'nalish / Maslahat</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-brand hover:bg-brand-light text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      1-Dars Bepul Joyni Band Qilish <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
