"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, Phone, User, Send, Sparkles, Loader2, Info } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import { submitLead, type LeadType } from "@/lib/leads";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: string;
}

const OTHER_VALUE = "Boshqa yo'nalish / Maslahat";

// Kurslar ro'yxati + maktab varianti
const SCHOOL_OPTION = "1-11 Sinf Xususiy Maktabi (To'liq kun)";

function buildOptions(): { value: string; type: LeadType }[] {
  return [
    { value: SCHOOL_OPTION, type: "maktab" as LeadType },
    ...ECOSYSTEM_DATA.courses.map((c) => ({ value: c.title, type: "kurs" as LeadType })),
    { value: OTHER_VALUE, type: "umumiy" as LeadType },
  ];
}

const NAV_TRIGGERS = /ariza|suhbat|konsultatsiya|savol|qabul 2026|header|mobil/i;

/** Yuboriladigan qiziqish qiymatini aniqlaydi (junk-triggerlardan tozalaydi). */
function resolveTarget(initialCourse: string): string {
  const t = (initialCourse || "").trim();
  if (!t) return ECOSYSTEM_DATA.courses[0]?.title || OTHER_VALUE;
  if (buildOptions().some((o) => o.value === t)) return t;
  if (NAV_TRIGGERS.test(t)) return OTHER_VALUE;
  return t; // mazmunli erkin qiymat (masalan: "5-sinf", "Ustoz bilan suhbat")
}

export default function LeadModal({
  isOpen,
  onClose,
  initialCourse = "Prezident Maktabiga Tayyorlov (PMT)",
}: LeadModalProps) {
  const options = buildOptions();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [courseValue, setCourseValue] = useState(initialCourse);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitNote, setSubmitNote] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  // Modal ochilganda formani yangi maqsad (initialCourse) bilan sinxronlash.
  // React tavsiya etgan "state-ni prop o'zgarishida sozlash" usuli:
  const [lastOpen, setLastOpen] = useState(isOpen);
  if (lastOpen !== isOpen) {
    setLastOpen(isOpen);
    if (isOpen) {
      const resolved = resolveTarget(initialCourse);
      setCourseValue(options.some((o) => o.value === resolved) ? resolved : OTHER_VALUE);
      setSubmitNote(null);
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

  // Escape bilan yopish + orqa fonda scroll bloklash
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
    const finalTarget = resolveTarget(initialCourse);
    const option = options.find((o) => o.value === courseValue) ?? options[0];
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      type: option.type,
      targetInterest: finalTarget === OTHER_VALUE ? OTHER_VALUE : finalTarget,
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
            <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto text-brand-500 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-white">
              Arizangiz Qabul Qilindi!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Mutaxassislarimiz 15 daqiqa ichida siz bilan bog'lanib, bepul sinov darsiga taklif qilishadi.
            </p>
            {submitNote && (
              <p className="flex items-start justify-center gap-2 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 max-w-sm mx-auto text-left">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitNote}</span>
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-4 px-8 py-3 rounded-full bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition"
            >
              Tushunarli
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-500 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5" /> 1-Dars Bepul Sinov Darsi
              </span>
              <h3 className="font-display text-2xl font-extrabold text-white">
                Kursga Ro'yxatdan O'tish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ismingiz va telefon raqamingizni qoldiring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot — botlar uchun (odamlar ko'rmaydi) */}
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  {options.map((o) => (
                    <option key={o.value} value={o.value} className="bg-slate-900">
                      {o.type === "maktab" ? "🏫 " : o.type === "kurs" ? "🎓 " : "📋 "}
                      {o.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      1-Dars Bepul Joyni Band Qilish <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-3">
                  Arizangiz bevosita Algoritm Academy qabul bo'limiga yuboriladi.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
