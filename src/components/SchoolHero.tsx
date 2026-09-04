"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";

interface SchoolHeroProps {
  onOpenLeadModal: (targetName?: string) => void;
}

interface Slide {
  id: number;
  image: string;
  kicker: string;
  title: string;
  desc: string;
  ctaText: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/slides/slide_6_campus_hall.jpg",
    kicker: "ALGORITM ACADEMY",
    title: "XUSUSIY MAKTAB VA AKADEMIYA",
    desc: "O'zbekistondagi nufuzli 0-11 xususiy maktab va ixtisoslashtirilgan ta'lim ekotizimi.",
    ctaText: "Birinchi bepul darsga yozilish",
  },
  {
    id: 2,
    image: "/images/slides/slide_3_cambridge_room.jpg",
    kicker: "CAMBRIDGE STANDARTLARI",
    title: "INGLIZ TILI VA XALQARO TA'LIM",
    desc: "Chuqurlashtirilgan chet tillari, individual yondashuv va jahon standartlari.",
    ctaText: "Sinov darsiga yozilish",
  },
  {
    id: 3,
    image: "/images/slides/slide_2_it_ai_lab.jpg",
    kicker: "ZAMONAVIY KO'NIKMALAR",
    title: "ROBOTOTEXNIKA VA SUN'IY INTELLEKT",
    desc: "Maktab davridanoq zamonaviy dasturlash, IT va robototexnika laboratoriyasi.",
    ctaText: "Bepul konsultatsiya olish",
  },
  {
    id: 4,
    image: "/images/slides/slide_5_live_class.jpg",
    kicker: "YUQORI AKADEMIK NATIJALAR",
    title: "DIGITAL SAT VA PREZIDENT MAKTABLARI",
    desc: "Nufuzli oliygohlar grantlari, xalqaro sertifikatlar va kafolatlangan ta'lim.",
    ctaText: "Qabul uchun ariza qoldirish",
  },
];

const SLIDE_INTERVAL = 4000;

export default function SchoolHero({ onOpenLeadModal }: SchoolHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const next = useCallback(() => setCurrentSlide((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrentSlide((p) => (p === 0 ? slides.length - 1 : p - 1)), []);
  const goTo = useCallback((idx: number) => setCurrentSlide(idx), []);

  // Avtomatik slayd almashishi (4 soniya) — hover'da to'xtaydi
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  // Klaviatura o'qlari
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative flex min-h-screen w-full items-end overflow-hidden pb-12 sm:pb-16 lg:pb-20 pt-24 text-white"
      aria-label="Algoritm ta'lim ekotizimi bosh sahifasi"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      {/* 1. To'liq ekranli fotosuratlar (Inter Nation uslubida tiniq, yorqin, 4s crossfade) */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={idx !== currentSlide}
          >
            <img
              src={s.image}
              alt=""
              className={`h-full w-full object-cover object-center ${
                idx === currentSlide ? "animate-ken-burns" : ""
              }`}
            />
            {/* Faqat chap-pastki matn o'qilishi uchun yengil tabiiy vinetka (ekranning 80% qismi ochiq va yorqin) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* 2. Chap-pastki burchakdagi toza, ixcham, qutisiz kontent (Inter Nation aniq analogi) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl text-left">
          
          {/* Oltin/sariq rangdagi kichik brend sarlavhasi (Kicker) */}
          <p className="animate-fade-up font-extrabold text-amber-400 text-xs sm:text-sm tracking-[0.22em] uppercase drop-shadow-md">
            {slide.kicker}
          </p>

          {/* Katta, dadil va sof oq rangdagi H1 (Hech qanday keraksiz qutisiz, rasm ustida to'g'ridan-to'g'ri) */}
          <h1 className="animate-fade-up mt-2 font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.08] tracking-tight text-white drop-shadow-lg [animation-delay:60ms]">
            {slide.title}
          </h1>

          {/* Birgina qisqa va aniq jumla (Ortiqcha detallashtirilgan uzun matnlar yo'q!) */}
          <p className="animate-fade-up mt-3.5 text-sm sm:text-base text-slate-100/90 font-medium max-w-xl leading-relaxed drop-shadow-md [animation-delay:120ms]">
            {slide.desc}
          </p>

          {/* Bitta yorqin va chaqiruvchi sarg'ish/olovrang tugma */}
          <div className="animate-fade-up mt-6 sm:mt-7 flex items-center gap-4 [animation-delay:180ms]">
            <button
              onClick={() => onOpenLeadModal(`${slide.title} — Bepul dars`)}
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{slide.ctaText}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. O'ng-pastki burchakdagi nozik, xalaqit bermaydigan slayd indikatorlari */}
      <div className="absolute bottom-6 right-5 sm:bottom-8 sm:right-10 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slayd ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-8 bg-amber-400" : "w-2.5 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

    </section>
  );
}
