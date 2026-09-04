"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [prevSlide, setPrevSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrentSlide((curr) => {
      const nxt = (curr + 1) % slides.length;
      setPrevSlide(curr);
      return nxt;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrentSlide((curr) => {
      const prv = curr === 0 ? slides.length - 1 : curr - 1;
      setPrevSlide(curr);
      return prv;
    });
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrentSlide((curr) => {
      if (curr === idx) return curr;
      setPrevSlide(curr);
      return idx;
    });
  }, []);

  // Avtomatik slayd almashishi (4 soniya) — sichqoncha ustiga borganda to'xtab turadi
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

  return (
    <section
      className="relative flex h-[85svh] sm:h-[90svh] lg:h-screen min-h-[500px] w-full flex-col justify-end overflow-hidden pb-8 sm:pb-12 lg:pb-16 pt-20 text-white select-none"
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
      {/* 1. Silky-smooth Dual Crossfade: Fotosuratlar va Matn birga yumshoq eriydi */}
      <div className="absolute inset-0 z-0 bg-night-deep">
        {slides.map((s, idx) => {
          const isCurrent = idx === currentSlide;
          const isPrev = idx === prevSlide;

          // Faqat joriy va uning ostidagi oldingi slayd ko'rinadi.
          // Joriy slayd (z-20) 1000ms davomida oldingi slayd (z-10) ustiga mayin erib chiqadi.
          // Qora fon ko'rinmaydi, rasm sakramaydi, matn birdan yo'qolib qolmaydi.
          const zIndex = isCurrent ? "z-20" : isPrev ? "z-10" : "z-0";
          const opacity = isCurrent ? "opacity-100" : isPrev ? "opacity-100" : "opacity-0";

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${zIndex} ${opacity}`}
              aria-hidden={!isCurrent}
            >
              {/* Fotosurat (Yumshoq, uzluksiz kinomatografik zoom) */}
              <img
                src={s.image}
                alt=""
                className={`h-full w-full object-cover object-[center_30%] sm:object-center transition-transform duration-[7000ms] ease-out will-change-transform ${
                  isCurrent ? "scale-105" : "scale-100"
                }`}
              />

              {/* Matn o'qilishi uchun tabiiy vinetka (ekranning katta qismi ochiq va yorug') */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

              {/* Matn va tugma har bir slayd bilan birga sinxron erib almashadi */}
              <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pointer-events-none">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
                  <div className={`max-w-xl text-left ${isCurrent ? "pointer-events-auto" : "pointer-events-none"}`}>
                    {/* Brend yashil rangidagi ixcham kicker */}
                    <p className="font-bold text-brand-400 text-[11px] sm:text-xs tracking-[0.2em] uppercase drop-shadow-md">
                      {s.kicker}
                    </p>

                    {/* Ixchamlashtirilgan, o'ta katta bo'lmagan H1 (mobilda 2 qatordan oshmaydi) */}
                    <h1 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-md">
                      {s.title}
                    </h1>

                    {/* Qisqa va lo'nda bitta jumla */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium max-w-md leading-relaxed drop-shadow-sm">
                      {s.desc}
                    </p>

                    {/* O'zimizning brend yashil rangidagi qulay tugma */}
                    <div className="mt-4 sm:mt-5 flex items-center gap-3">
                      <button
                        onClick={() => onOpenLeadModal(`${s.title} — Bepul dars`)}
                        tabIndex={isCurrent ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold px-6 sm:px-7 py-3 text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 fill-white text-white" />
                        <span>{s.ctaText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* 2. Desktop uchun qulay nozik yon o'qlar (hover'da ko'rinadi) */}
      <div className="absolute inset-y-0 left-4 z-30 hidden sm:flex items-center pointer-events-none">
        <button
          onClick={prev}
          aria-label="Oldingi slayd"
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 z-30 hidden sm:flex items-center pointer-events-none">
        <button
          onClick={next}
          aria-label="Keyingi slayd"
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. O'ng-pastki burchakdagi zamonaviy nozik indikatorlar */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 lg:bottom-10 lg:right-12 z-30 flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slayd ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              idx === currentSlide ? "w-7 bg-brand-400" : "w-2 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

    </section>
  );
}
