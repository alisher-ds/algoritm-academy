"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface DiagnosticQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (courseTitle: string) => void;
}

export default function DiagnosticQuizModal({
  isOpen,
  onClose,
  onSelectCourse,
}: DiagnosticQuizModalProps) {
  const [step, setStep] = useState(1);
  const [interest, setInterest] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    description: string;
    track: string;
    branch: string;
  } | null>(null);

  // Escape bilan yopish + orqa fonda scroll bloklash
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCalculate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      let res = {
        title: "Prezident Maktabiga Tayyorlov (PMT)",
        description: "Mantiqiy fikrlash, Cambridge ingliz tili va olimpiada darajasidagi matematika bo'yicha intensiv kurs.",
        track: "Algoritm Academy (O'quv Markazi)",
        branch: "Qarshi sh., Islom Karimov 291V",
      };

      if (interest === "sat") {
        res = {
          title: "SAT Digital & Xalqaro Grantlar Dasturi",
          description: "Digital SAT platformasi, Math va Reading modullari bo'yicha xalqaro grant yutish kursi.",
          track: "Algoritm Academy (O'quv Markazi)",
          branch: "Qarshi sh., Islom Karimov 291V",
        };
      } else if (interest === "ielts") {
        res = {
          title: "IELTS 7.5+ & CEFR Intensive",
          description: "Speaking va Writing bo'yicha kuchli mentorlar bilan xalqaro sertifikat olish dasturi.",
          track: "Algoritm Academy (O'quv Markazi)",
          branch: "Qarshi sh., Islom Karimov 291V",
        };
      } else if (interest === "math") {
        res = {
          title: "Matematika (Milliy Sertifikat A+ & DTM)",
          description: "Milliy sertifikat A+ va OTM davlat grantlariga kirishga qaratilgan chuqurlashtirilgan mualliflik kursi.",
          track: "Algoritm Academy (O'quv Markazi)",
          branch: "Qarshi sh., Islom Karimov 291V",
        };
      }

      setResult(res);
      setStep(4);
      try {
        confetti({ particleCount: 80, spread: 60, colors: ["#00c853", "#ffffff"] });
      } catch {}
    }, 1000);
  };

  const handleReset = () => {
    setStep(1);
    setInterest("");
    setResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="relative w-full max-w-lg bg-night border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {analyzing ? (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-white">
              Natijangiz tahlil qilinmoqda...
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Algoritm Academy mezonlari bo'yicha sizga eng mos kurs saralanmoqda.
            </p>
          </div>
        ) : step === 4 && result ? (
          <div className="py-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider block">
                  Tavsiya etilgan kurs
                </span>
                <h3 className="text-xl font-black text-white">{result.title}</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.description}
              </p>
              <div className="pt-3 border-t border-white/10 flex flex-col gap-1 text-xs text-slate-400">
                <span>🏛 <strong>Markaz:</strong> {result.track}</span>
                <span>📍 <strong>Manzil:</strong> {result.branch}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onSelectCourse(result.title);
                }}
                className="flex-1 py-3.5 rounded-full bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition flex items-center justify-center gap-2"
              >
                1-Dars Bepul Joy Olish <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3.5 rounded-full bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition"
              >
                Qayta test qilish
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider block mb-1">
                Kurs Tanlash Testi · {step}/3-bosqich
              </span>
              <h3 id="quiz-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {step === 1 && "Qaysi yo'nalishga qiziqyapsiz?"}
                {step === 2 && "Yoshingiz yoki sinfingiz?"}
                {step === 3 && "Asosiy maqsadingiz nima?"}
              </h3>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-3">
                {[
                  { id: "pmt", label: "🌟 Prezident Maktabiga Tayyorlov (PMT)" },
                  { id: "sat", label: "🌍 SAT Digital & Xalqaro Grant" },
                  { id: "ielts", label: "🇬🇧 IELTS 7.5+ & Intensive English" },
                  { id: "math", label: "📐 Matematika (Milliy Sertifikat & DTM)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setInterest(item.id);
                      setStep(2);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500 hover:bg-white/10 transition text-sm font-semibold text-white flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-3">
                {[
                  "3 - 4 sinf (PMT yoshi)",
                  "5 - 8 sinf (O'rta maktab)",
                  "9 - 11 sinf (Abituriyent / Yuqori)",
                  "Talaba yoki Katta yoshdagilar",
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStep(3)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500 hover:bg-white/10 transition text-sm font-semibold text-white flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-3">
                {[
                  "Prezident yoki ixtisoslashgan maktabga kirish",
                  "SAT / IELTS olib xorijiy grant yutish",
                  "Davlat OTMlariga byudjet / grant asosida kirish",
                  "Matematika bilimlarini mustahkamlash",
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={handleCalculate}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500 hover:bg-white/10 transition text-sm font-semibold text-white flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-4 h-4 text-brand-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
