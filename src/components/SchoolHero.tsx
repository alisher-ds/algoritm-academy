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
    title: "Xususiy Maktab & Akademiya",
    desc: "0–11 sinf xususiy maktabi va ixtisoslashtirilgan ta'lim tizimi.",
    ctaText: "Bepul sinov darsi",
  },
  {
    id: 2,
    image: "/images/slides/slide_3_cambridge_room.jpg",
    kicker: "CAMBRIDGE STANDARTLARI",
    title: "Ingliz Tili & Xalqaro Ta'lim",
    desc: "Chuqurlashtirilgan chet tillari va individual yondashuv.",
    ctaText: "Sinov darsiga yozilish",
  },
  {
    id: 3,
    image: "/images/slides/slide_2_it_ai_lab.jpg",
    kicker: "ZAMONAVIY KO'NIKMALAR",
    title: "Robototexnika & Sun'iy Intellekt",
    desc: "Amaliy dasturlash va zamonaviy texnologiyalar laboratoriyasi.",
    ctaText: "Konsultatsiya olish",
  },
  {
    id: 4,
    image: "/images/slides/slide_5_live_class.jpg",
    kicker: "YUQORI NATIJALAR",
    title: "Digital SAT & Prezident Maktabi",
    desc: "Xalqaro grantlar va nufuzli olimpiadalarga tayyorlov.",
    ctaText: "Qabulga yozilish",
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
      className="relative flex h-[85svh] sm:h-[90svh] lg:h-screen min-h-[500px] w-full flex-col justify-end overflow-hidden pb-8 sm:pb-12 lg:pb-16 pt-20 text-white"
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
      {/* 1. To'liq ekranli fotosuratlar (mobilga mos fokus, cho'zilmaydi, 4s crossfade) */}
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
              className={`h-full w-full object-cover object-[center_30%] sm:object-center ${
                idx === currentSlide ? "animate-ken-burns" : ""
              }`}
            />
            {/* Matn o'qilishi uchun yengil tabiiy vinetka — ekranning katta qismi ochiq va yorug' */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />
          </div>
        ))}
      </div>

      {/* 2. Chap-pastki burchakdagi ixcham, qutisiz, o'zimizning brend yashil uslubidagi kontent */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="max-w-xl text-left">
          
          {/* O'zimizning brend yashil rangidagi ixcham nishon (Kicker) */}
          <p className="animate-fade-up font-bold text-brand-400 text-[11px] sm:text-xs tracking-[0.2em] uppercase drop-shadow-md">
            {slide.kicker}
          </p>

          {/* Ixchamlashtirilgan, o'ta katta bo'lmagan H1 (mobilda 2 qatordan oshmaydi) */}
          <h1 className="animate-fade-up mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-md [animation-delay:60ms]">
            {slide.title}
          </h1>

          {/* Qisqa va lo'nda bitta jumla */}
          <p className="animate-fade-up mt-2 text-xs sm:text-sm text-slate-200/90 font-medium max-w-md leading-relaxed drop-shadow-sm [animation-delay:120ms]">
            {slide.desc}
          </p>

          {/* O'zimizning brend yashil rangidagi qulay tugma */}
          <div className="animate-fade-up mt-4 sm:mt-5 flex items-center gap-3 [animation-delay:180ms]">
            <button
              onClick={() => onOpenLeadModal(`${slide.title} — Bepul dars`)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold px-6 sm:px-7 py-3 text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white text-white" />
              <span>{slide.ctaText}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. O'ng-pastki burchakdagi nozik indikatorlar */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 lg:bottom-10 lg:right-12 z-20 flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slayd ${idx + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-6 bg-brand-400" : "w-2 bg-white/40 hover:bg-white/65"
            }`}
          />
        ))}
      </div>

    </section>
  );
}
