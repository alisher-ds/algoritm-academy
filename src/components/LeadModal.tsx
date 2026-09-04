"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, Phone, User, Send, Sparkles, Loader2, Info } from "lucide-react";
import { submitLead, type LeadType } from "@/lib/leads";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: string;
}

export interface LeadOption {
  value: string;
  type: LeadType;
  label: string;
}

export const LEAD_OPTIONS: LeadOption[] = [
  // Maktab bo'limi
  { value: "0–11 Sinf Xususiy Maktabi (To'liq kun)", type: "maktab", label: "🏫 0–11 Sinf Xususiy Maktabi (To'liq kun)" },
  { value: "0-Sinf & Maktabgacha Tayyorlov", type: "maktab", label: "🏫 0-Sinf & Maktabgacha Tayyorlov" },
  { value: "1–4 Sinf: Boshlang'ich & PMT poydevori", type: "maktab", label: "🏫 1–4 Sinf: Boshlang'ich & PMT" },
  { value: "5–8 Sinf: O'rta Ta'lim & Olimpiadalar", type: "maktab", label: "🏫 5–8 Sinf: O'rta Maktab & Olimpiadalar" },
  { value: "9–11 Sinf: Yuqori Sinf & SAT/OTM Grant", type: "maktab", label: "🏫 9–11 Sinf: Yuqori Sinf & SAT/OTM Grant" },

  // O'quv markazi kurslari
  { value: "Prezident Maktabiga Tayyorlov (PMT)", type: "kurs", label: "🎓 Prezident Maktabiga Tayyorlov (PMT)" },
  { value: "Digital SAT & Xalqaro Universitetlar", type: "kurs", label: "🎓 Digital SAT & Xalqaro Universitetlar" },
  { value: "IELTS 7.5+ & Akademik Ingliz Tili", type: "kurs", label: "🎓 IELTS 7.5+ & Akademik Ingliz Tili" },
  { value: "Matematika (Milliy Sertifikat A+ & DTM)", type: "kurs", label: "🎓 Matematika (Milliy Sertifikat A+ & DTM)" },
  { value: "Robototexnika & Sun'iy Intellekt", type: "kurs", label: "🎓 Robototexnika & Sun'iy Intellekt" },

  // Umumiy
  { value: "Boshqa yo'nalish / Maslahat olish", type: "umumiy", label: "📋 Boshqa yo'nalish / Maslahat olish" },
];

function matchInitialCourse(initial?: string): string {
  if (!initial) return LEAD_OPTIONS[0].value;
  const s = initial.toLowerCase().trim();

  if (s.includes("robot") || s.includes("intellekt") || s.includes("ai")) {
    return "Robototexnika & Sun'iy Intellekt";
  }
  if (s.includes("sat")) {
    return "Digital SAT & Xalqaro Universitetlar";
  }
  if (s.includes("pmt") || s.includes("prezident")) {
    return "Prezident Maktabiga Tayyorlov (PMT)";
  }
  if (s.includes("ielts") || s.includes("ingliz") || s.includes("cefr") || s.includes("cambridge")) {
    return "IELTS 7.5+ & Akademik Ingliz Tili";
  }
  if (s.includes("matematika") || s.includes("dtm") || s.includes("sertifikat")) {
    return "Matematika (Milliy Sertifikat A+ & DTM)";
  }
  if (s.includes("0-sinf") || s.includes("maktabgacha")) {
    return "0-Sinf & Maktabgacha Tayyorlov";
  }
  if (s.includes("1–4") || s.includes("1-4") || s.includes("boshlang'ich")) {
    return "1–4 Sinf: Boshlang'ich & PMT poydevori";
  }
  if (s.includes("5–8") || s.includes("5-8") || s.includes("o'rta")) {
    return "5–8 Sinf: O'rta Ta'lim & Olimpiadalar";
  }
  if (s.includes("9–11") || s.includes("9-11") || s.includes("yuqori")) {
    return "9–11 Sinf: Yuqori Sinf & SAT/OTM Grant";
  }
  if (s.includes("maktab") || s.includes("school") || s.includes("akademiya") || s.includes("sinf")) {
    return "0–11 Sinf Xususiy Maktabi (To'liq kun)";
  }

  const direct = LEAD_OPTIONS.find((o) => o.value.toLowerCase() === s);
  if (direct) return direct.value;

  return "Boshqa yo'nalish / Maslahat olish";
}

export default function LeadModal({
  isOpen,
  onClose,
  initialCourse,
}: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [courseValue, setCourseValue] = useState(() => matchInitialCourse(initialCourse));
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitNote, setSubmitNote] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  // React tavsiya etgan prop o'zgarishini render vaqtida sozlash (zero-cascade renders):
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [prevCourse, setPrevCourse] = useState(initialCourse);

  if (prevOpen !== isOpen || prevCourse !== initialCourse) {
    setPrevOpen(isOpen);
    setPrevCourse(initialCourse);
    if (isOpen) {
      setCourseValue(matchInitialCourse(initialCourse));
      setSubmitNote(null);
      setSubmitted(false);
    }
  }

  const handleClose = useCallback(() => {
    setSubmitted(false);
    setSubmitNote(null);
    setName("");
    setPhone("+998");
    setHoneypot("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || digits.length < 9) return;

    setLoading(true);

    const chosen = LEAD_OPTIONS.find((o) => o.value === courseValue) ?? {
      value: courseValue,
      type: "umumiy" as LeadType,
      label: courseValue,
    };

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      type: chosen.type,
      targetInterest: chosen.value,
      source: "Sayt — ro'yxatdan o'tish oynasi",
      website: honeypot,
    };

    const res = await submitLead(payload);
    setLoading(false);
    setSubmitted(true);
    setSubmitNote(
      res.ok
        ? null
        : res.storedLocally
          ? "Serverga ulanish imkoni bo'lmadi — arizangiz shu qurilmada saqlandi. Qo'ng'iroq qilib tasdiqlashingiz mumkin."
          : res.error || "Xatolik yuz berdi"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-night border border-white/20 p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-white">
              Arizangiz Qabul Qilindi!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {submitNote || "Tez orada mutaxassisimiz siz bilan bog'lanib, bepul sinov darsi vaqtini kelishadi."}
            </p>
            {submitNote && (
              <p className="text-[11px] text-amber-300/90 flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Qurilmangizda saqlandi</span>
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-4 px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-brand-500/20"
            >
              Yopish
            </button>
          </div>
        ) : (
          <div>
            <div className="text-left mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase border border-brand-500/30">
                <Sparkles className="w-3 h-3" />
                1 Kunlik Bepul Sinov Darsi
              </span>
              <h3 className="font-display text-2xl font-extrabold text-white mt-2">
                Qabulga Yozilish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ismingiz, telefon raqamingiz va yo'nalishni tanlang.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute left-[-9999px] w-px h-px opacity-0"
              />

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Ism va Familiyangiz
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="Masalan: Jasur Rahimov"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setPhone(digits ? `+998 ${digits.replace(/^998/, "")}` : "+998");
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Qaysi yo'nalishga yozilmoqchisiz?
                </label>
                <select
                  value={courseValue}
                  onChange={(e) => setCourseValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  {LEAD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-slate-900 text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 fill-slate-950" />
                      <span>Ariza Yuborish</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Ma&apos;lumotlaringiz maxfiy saqlanadi. Mutaxassisimiz 15 daqiqada aloqaga chiqadi.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
