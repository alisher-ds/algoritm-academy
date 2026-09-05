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

// ============================================================================
// EHTIYOTKORLIK UCHUN SAQLANGAN AVVALGI SLAYDER SOZLAMALARI:
// (Foydalanuvchi so'roviga binoan bitta rasm rejimi yoqildi.
//  Agar avvalgi avto-o'tadigan 4 ta slaydni qaytarish kerak bo'lsa,
//  USE_SINGLE_HERO_IMAGE = false qilish kifoya!)
// ============================================================================
export const USE_SINGLE_HERO_IMAGE = true;

export const BACKUP_SLIDES: Slide[] = [
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

const SINGLE_HERO_DATA = {
  image: "/images/algoritm_maktabi_hero.png",
  kicker: "ALGORITM ACADEMY",
  title: "Xususiy Maktab & Akademiya",
  desc: "0–11 sinf xususiy maktabi, xalqaro ta'lim standartlari va ixtisoslashtirilgan chuqur tayyorlov.",
  ctaText: "Bepul sinov darsi",
};

const SLIDE_INTERVAL = 4000;

export default function SchoolHero({ onOpenLeadModal }: SchoolHeroProps) {
  const slides = BACKUP_SLIDES;
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
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrentSlide((curr) => {
      const prv = curr === 0 ? slides.length - 1 : curr - 1;
      setPrevSlide(curr);
      return prv;
    });
  }, [slides.length]);

  const goTo = useCallback((idx: number) => {
    setCurrentSlide((curr) => {
      if (curr === idx) return curr;
      setPrevSlide(curr);
      return idx;
    });
  }, []);

  // Avtomatik slayd almashishi (4 soniya)
  useEffect(() => {
    if (USE_SINGLE_HERO_IMAGE) return undefined;
    if (paused) return undefined;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  // Klaviatura o'qlari
  useEffect(() => {
    if (USE_SINGLE_HERO_IMAGE) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // ==========================================================================
  // 1. FOYDALANUVCHI SO'RAGAN BITTA 4K RASM REJIMI (TEST UCHUN)
  // ==========================================================================
  if (USE_SINGLE_HERO_IMAGE) {
    return (
      <section
        className="relative flex min-h-[90svh] lg:min-h-screen w-full flex-col justify-between overflow-hidden pt-24 pb-8 sm:pb-12 text-white bg-slate-950 select-none"
        aria-label="Algoritm Maktabi bosh sahifasi"
      >
        {/* 1. Orqa fon: Luks qorong'u fon va marmar/oltin nurining mayin akslanishi */}
        <div className="absolute inset-0 z-0 bg-[#070b12] overflow-hidden">
          {/* Ambient fon xiralashtirilgan nusxasi (ekranning ikki chetiga oltin va marmar iliq tusini taratadi) */}
          <img
            src={SINGLE_HERO_DATA.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-20 scale-110 pointer-events-none"
          />
          {/* Subtle radial warmth in center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_transparent_70%)] pointer-events-none" />
        </div>

        {/* 2. Asosiy 4K Aniq Ko'rinuvchi Fotosurat Markazi — Logotip va Oltin Yozuv 100% Aniq Ko'rinadi */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 my-auto py-2">
          <div className="relative w-fit max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 ring-1 ring-amber-400/25 bg-[#1b1e24] group">
            {/* Fotosurat — hech qanday harfi yoki logotipi kesilmagan, 100% tiniq va tabiiy yorqin ranglarda */}
            <img
              src={SINGLE_HERO_DATA.image}
              alt="Algoritm Maktabi"
              className="w-auto h-auto max-h-[54vh] sm:max-h-[62vh] lg:max-h-[66vh] object-contain block mx-auto"
            />
            {/* Nozik ichki ramka nuri */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
        </div>

        {/* 3. Pastki zamonaviy CTA va qabul paneli */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-2">
          <div className="rounded-2xl sm:rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 p-3.5 sm:p-4 sm:px-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="text-center sm:text-left">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>0–11 Sinf Xususiy Maktabi & Akademiya</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                Xalqaro standartlar, zamonaviy sharoitlar va 1 kunlik bepul sinov darsi
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center">
              <button
                onClick={() => onOpenLeadModal("Algoritm Maktabi Qabul 2026")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold px-6 py-3 text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Bepul Sinov Darsi</span>
              </button>

              <a
                href="#maktab"
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3 text-xs uppercase tracking-wider border border-white/15 transition cursor-pointer"
              >
                <span>Dasturlar</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // 2. AVVALGI 4 TA AYLANADIGAN KINETIK SLAYDER (AGAR KERAK BO'LSA)
  // ==========================================================================
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
      {/* Silky-smooth Dual Crossfade */}
      <div className="absolute inset-0 z-0 bg-night-deep">
        {slides.map((s, idx) => {
          const isCurrent = idx === currentSlide;
          const isPrev = idx === prevSlide;
          const zIndex = isCurrent ? "z-20" : isPrev ? "z-10" : "z-0";
          const opacity = isCurrent ? "opacity-100" : isPrev ? "opacity-100" : "opacity-0";

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${zIndex} ${opacity}`}
              aria-hidden={!isCurrent}
            >
              <img
                src={s.image}
                alt=""
                className={`h-full w-full object-cover object-[center_30%] sm:object-center transition-transform duration-[7000ms] ease-out will-change-transform ${
                  isCurrent ? "scale-105" : "scale-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pointer-events-none">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
                  <div className={`max-w-xl text-left ${isCurrent ? "pointer-events-auto" : "pointer-events-none"}`}>
                    <p className="font-bold text-brand-400 text-[11px] sm:text-xs tracking-[0.2em] uppercase drop-shadow-md">
                      {s.kicker}
                    </p>

                    <h1 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-md">
                      {s.title}
                    </h1>

                    <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium max-w-md leading-relaxed drop-shadow-sm">
                      {s.desc}
                    </p>

                    <div className="mt-4 sm:mt-5 flex items-center gap-3">
                      <button
                        onClick={() => onOpenLeadModal(s.title)}
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

      {/* Desktop uchun qulay nozik yon o'qlar */}
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

      {/* O'ng-pastki burchakdagi indikatorlar */}
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
