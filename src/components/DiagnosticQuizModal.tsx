"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

type Stage = "boshlangich" | "orta" | "abituriyent" | "katta";

interface QuizResult {
  title: string;
  description: string;
  track: string;
  branch: string;
  /** Nega aynan shu kurs tavsiya etilgani — foydalanuvchining javoblariga asoslangan. */
  reason: string;
}

const BRANCH = "Qarshi sh., Islom Karimov 291V";
const TRACK = "Algoritm Academy (O'quv Markazi)";

const STAGES: { id: Stage; label: string }[] = [
  { id: "boshlangich", label: "3 - 4 sinf (PMT yoshi)" },
  { id: "orta", label: "5 - 8 sinf (O'rta maktab)" },
  { id: "abituriyent", label: "9 - 11 sinf (Abituriyent / Yuqori)" },
  { id: "katta", label: "Talaba yoki katta yoshdagilar" },
];

const GOALS = [
  "Prezident yoki ixtisoslashgan maktabga kirish",
  "SAT / IELTS olib xorijiy grant yutish",
  "Davlat OTMlariga byudjet / grant asosida kirish",
  "Matematika bilimlarini mustahkamlash",
];

/**
 * Uchala bosqich javobini ham hisobga oladi.
 *
 * Ilgari natija FAQAT 1-bosqichdan hisoblanardi — yosh va maqsad savollari
 * umuman ishlatilmasdi, ya'ni "3 bosqichli diagnostika" aslida 1 bosqichli edi.
 */
function recommend(interest: string, stage: Stage | "", goal: string): QuizResult {
  const base = (title: string, description: string, reason: string): QuizResult => ({
    title,
    description,
    track: TRACK,
    branch: BRANCH,
    reason,
  });

  // Yosh eng kuchli cheklov: PMT imtihoni 4-sinf yakunida topshiriladi.
  if (stage === "boshlangich") {
    return base(
      "Prezident Maktabiga Tayyorlov (PMT)",
      "Mantiqiy fikrlash, Cambridge ingliz tili va olimpiada darajasidagi matematika bo'yicha intensiv kurs.",
      "3–4 sinf — PMT imtihoniga tayyorgarlik uchun eng mos yosh."
    );
  }

  // SAT 8-sinfdan boshlab ma'noli; kichik yoshda o'rniga poydevor kerak.
  if (interest === "sat") {
    if (stage === "orta") {
      return base(
        "IELTS 7+ & CEFR Intensive",
        "Speaking, Writing, Reading va Listening ko'nikmalarini jadal rivojlantirish va xalqaro sertifikat olish kursi.",
        "SAT uchun hali erta — avval ingliz tili poydevorini mustahkamlash tavsiya etiladi."
      );
    }
    return base(
      "SAT Digital & Xalqaro Grantlar Dasturi",
      "AQSH va xorijiy nufuzli universitetlarga grant yutish uchun SAT Math va Reading & Writing intensiv kursi.",
      "Xalqaro grant maqsadi va mos yosh — SAT to'g'ridan-to'g'ri shu yo'nalish."
    );
  }

  if (interest === "ielts") {
    return base(
      "IELTS 7+ & CEFR Intensive",
      "Speaking, Writing, Reading va Listening ko'nikmalarini jadal rivojlantirish va xalqaro sertifikat olish kursi.",
      "Xalqaro til sertifikati — barcha yoshlar uchun ochiq yo'nalish."
    );
  }

  if (interest === "math") {
    // Abituriyent uchun DTM/Milliy sertifikat, kichikroq yosh uchun umumiy matematika.
    return base(
      "Matematika (Milliy Sertifikat A+ & DTM)",
      "Milliy sertifikat A+ va OTM davlat grantlariga kirishga qaratilgan chuqurlashtirilgan mualliflik kursi.",
      stage === "abituriyent"
        ? "9–11 sinf va grant maqsadi — Milliy sertifikat eng qisqa yo'l."
        : "Matematikani chuqurlashtirish — keyingi bosqichlarga mustahkam poydevor."
    );
  }

  // interest === "pmt", lekin yosh o'tib ketgan bo'lsa — maqsadga qarab yo'naltiramiz.
  if (goal.includes("xorijiy grant")) {
    return base(
      "SAT Digital & Xalqaro Grantlar Dasturi",
      "AQSH va xorijiy nufuzli universitetlarga grant yutish uchun SAT Math va Reading & Writing intensiv kursi.",
      "PMT yoshi o'tgan, ammo maqsad xorijiy grant — SAT shu maqsadga olib boradi."
    );
  }
  if (goal.includes("Davlat OTM")) {
    return base(
      "Matematika (Milliy Sertifikat A+ & DTM)",
      "Milliy sertifikat A+ va OTM davlat grantlariga kirishga qaratilgan chuqurlashtirilgan mualliflik kursi.",
      "Davlat granti maqsadi — Milliy sertifikat va DTM yo'nalishi."
    );
  }
  return base(
    "Prezident Maktabiga Tayyorlov (PMT)",
    "Mantiqiy fikrlash, Cambridge ingliz tili va olimpiada darajasidagi matematika bo'yicha intensiv kurs.",
    "Tanlovingiz bo'yicha eng mos yo'nalish."
  );
}

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
  const [stage, setStage] = useState<Stage | "">("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Tahlil taymeri — oyna yopilsa bekor qilinadi, aks holda yopilgandan keyin
  // confetti otilib, natija ekrani fon rejimida ochilib qolardi.
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // `isOpen` o'zgarganda (yopilganda ham, ochilganda ham) kutayotgan taymer bekor qilinadi.
    return () => {
      if (analyzeTimer.current) {
        clearTimeout(analyzeTimer.current);
        analyzeTimer.current = null;
      }
    };
  }, [isOpen]);

  // Oyna yopilib qayta ochilganda testni boshidan boshlash. Ilgari `step` va
  // `result` tiklanmasdi va foydalanuvchi 1-bosqich o'rniga eski natijani ko'rardi.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setInterest("");
      setStage("");
      setResult(null);
      setAnalyzing(false);
    }
  }

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

  const handleCalculate = (goal: string) => {
    setAnalyzing(true);
    analyzeTimer.current = setTimeout(() => {
      setAnalyzing(false);
      setResult(recommend(interest, stage, goal));
      setStep(4);
      try {
        confetti({ particleCount: 80, spread: 60, colors: ["#00c853", "#ffffff"] });
      } catch {
        // confetti ishlamasa test natijasi baribir ko'rsatiladi
      }
    }, 900);
  };

  const handleReset = () => {
    setStep(1);
    setInterest("");
    setStage("");
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
              <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5 text-xs text-slate-400">
                <span className="text-brand-300">
                  <strong className="text-brand-400">Nega aynan shu:</strong> {result.reason}
                </span>
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
                  { id: "ielts", label: "🇬🇧 IELTS 7+ & Intensive English" },
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
                {STAGES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setStage(item.id);
                      setStep(3);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500 hover:bg-white/10 transition text-sm font-semibold text-white flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-3">
                {GOALS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleCalculate(item)}
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
