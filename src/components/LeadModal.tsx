"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, Phone, User, Send, Loader2, Info, AlertCircle } from "lucide-react";
import { submitLead, LEAD_OPTIONS, type LeadOption, type LeadType } from "@/lib/leads";
import { normalizeUzPhone } from "@/lib/phone";

export { LEAD_OPTIONS };
export type { LeadOption };

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: string;
}

function matchInitialCourse(initial?: string): string {
  if (!initial) return LEAD_OPTIONS[0].value;
  const s = initial.toLowerCase().trim();

  // 1. To'g'ridan-to'g'ri moslik (agar to'liq tanlov matni uzatilgan bo'lsa)
  const direct = LEAD_OPTIONS.find((o) => o.value.toLowerCase() === s);
  if (direct) return direct.value;

  // 2. Prezident maktabi (umumiy "maktab" dan oldin tekshirilishi shart, chunki nomi maktab so'zini o'z ichiga oladi)
  if (s.includes("pmt") || s.includes("prezident")) {
    return "Prezident maktabiga tayyorlov";
  }

  // 3. Maktab va maktabgacha
  if (s.includes("maktabgacha") || s.includes("0-sinf")) {
    return "Maktabgacha tayyorlov";
  }
  if (s.includes("maktab") || s.includes("school") || s.includes("sinf")) {
    return "0–11 Sinf Xususiy Maktabi";
  }

  // 4. Akademik kurslar & fanlar
  if (s.includes("bio")) return "Biologiya";
  if (s.includes("kimyo")) return "Kimyo";
  if (s.includes("fizik")) return "Fizika";
  if (s.includes("huquq")) return "Huquq";
  if (s.includes("tarix")) return "Tarix";
  if (s.includes("ona tili") || s.includes("adabiyot")) return "Ona tili";
  if (s.includes("sat")) return "Digital SAT";
  if (s.includes("ielts")) return "IELTS 7+";
  if (s.includes("ingliz") && (s.includes("0") || s.includes("beginner") || s.includes("noldan"))) {
    return "Ingliz tili 0 dan";
  }
  if (s.includes("ingliz") || s.includes("cefr")) return "IELTS 7+";
  if (s.includes("matem")) return "Matematika";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCourseValue(matchInitialCourse(initialCourse));
      setSubmitNote(null);
      setErrorMessage(null);
      setSubmitted(false);
    }
  }, [isOpen, initialCourse]);

  const handleClose = useCallback(() => {
    setSubmitted(false);
    setSubmitNote(null);
    setErrorMessage(null);
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

    if (!name.trim()) {
      setErrorMessage("Iltimos, ismingizni kiriting.");
      return;
    }
    // Server bilan bitta manba: "+998 " prefiksi digits ichida bo'lgani uchun
    // oddiy uzunlik tekshiruvi 3 raqamga adashardi va chala raqam serverga ketardi.
    if (!normalizeUzPhone(phone)) {
      setErrorMessage("Iltimos, to'liq telefon raqamingizni kiriting (masalan: 90 123 45 67).");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const chosen = LEAD_OPTIONS.find((o) => o.value === courseValue) ?? {
      value: courseValue,
      type: "umumiy" as LeadType,
      label: courseValue,
    };

    const customNote =
      initialCourse && initialCourse.trim() !== chosen.value
        ? initialCourse.trim()
        : undefined;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      type: chosen.type,
      targetInterest: chosen.value,
      source: "Sayt — ro'yxatdan o'tish oynasi",
      notes: customNote,
      website: honeypot,
    };

    const res = await submitLead(payload);
    setLoading(false);

    if (res.ok || res.storedLocally) {
      setSubmitted(true);
      setSubmitNote(
        res.ok
          ? null
          : "Serverga ulanish imkoni bo'lmadi — arizangiz shu qurilmada saqlandi. Qo'ng'iroq qilib tasdiqlashingiz mumkin."
      );
    } else {
      setErrorMessage(
        res.error || "Arizani yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki to'g'ridan-to'g'ri bog'laning."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="relative w-full max-w-lg rounded-3xl bg-night border border-white/20 p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
              <h3 id="lead-modal-title" className="font-display text-2xl font-extrabold text-white">
                Qabulga Yozilish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ismingiz, telefon raqamingiz va yo'nalishni tanlang.
              </p>
              {initialCourse && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <span>Tanlangan so'rov: <strong className="text-white">{initialCourse}</strong></span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {/* Botlar to'ldiradigan yashirin maydon (yuqoridagi izohga qarang). */}
              <div hidden>
                <label htmlFor="lead-website-modal">Veb-sayt (to'ldirmang)</label>
                <input
                  id="lead-website-modal"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lead-name" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Ism va Familiyangiz
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="lead-name"
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
                <label htmlFor="lead-phone" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Telefon Raqamingiz
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="lead-phone"
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
                <label htmlFor="lead-course" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Qaysi yo'nalishga yozilmoqchisiz?
                </label>
                <select
                  id="lead-course"
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
                Ma&apos;lumotlaringiz maxfiy saqlanadi. Mutaxassisimiz tez orada aloqaga chiqadi.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
