"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, School, GraduationCap, Users, Clock, Award, ChevronLeft, ChevronRight } from "lucide-react";

interface SchoolHeroProps {
  onOpenLeadModal: (targetName?: string) => void;
}

interface Slide {
  id: number;
  image: string;
  kicker: string;
  title: string;
  desc: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/slides/slide_6_campus_hall.jpg",
    kicker: "Algoritm School · 0-11 Xususiy Maktab",
    title: "Kelajak Liderlari Uchun Zamonaviy Ta'lim",
    desc: "0–11 sinf chuqurlashtirilgan maktab, 3 mahal issiq ovqat va har bir sinfda qat'iy 15 nafarlik kvota.",
  },
  {
    id: 2,
    image: "/images/slides/slide_3_cambridge_room.jpg",
    kicker: "Cambridge Standartidagi Sinflar",
    title: "Chuqurlashtirilgan Tillar & Individual Yondashuv",
    desc: "Matematika va ingliz tili xalqaro standartlarda, tajribali ustozlar nazoratida o'qitiladi.",
  },
  {
    id: 3,
    image: "/images/slides/slide_2_it_ai_lab.jpg",
    kicker: "Innovatsion Ko'nikmalar · IT & AI",
    title: "Robototexnika & Amaliy Dasturlash Laboratoriyasi",
    desc: "0-sinfdanoq amaliy robototexnika, AI va darsdan so'ng 15 dan ortiq bepul to'garaklar.",
  },
  {
    id: 4,
    image: "/images/slides/slide_5_live_class.jpg",
    kicker: "Akademik Natijadorlik · 2026",
    title: "Digital SAT 1500+ & Prezident Maktablari",
    desc: "Davlat grantlari, xalqaro sertifikatlar va nufuzli olimpiada g'oliblarini tayyorlash tajribasi.",
  },
];

const microStats = [
  { icon: Users, label: "Maksimal 15 o'quvchi" },
  { icon: Clock, label: "08:00 – 17:00 to'liq kun" },
  { icon: Award, label: "Kafolatlangan natija" },
];

const SLIDE_INTERVAL = 4000;

export default function SchoolHero({ onOpenLeadModal }: SchoolHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const lastSlide = slides.length - 1;

  const next = useCallback(() => setCurrentSlide((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrentSlide((p) => (p === 0 ? lastSlide : p - 1)), [lastSlide]);
  const goTo = useCallback((idx: number) => setCurrentSlide((idx + slides.length) % slides.length), []);

  // Avtomatik slayd almashishi (4 soniya) — hover'da pauza
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
      className="relative flex min-h-[92svh] sm:min-h-[94svh] items-end overflow-hidden bg-night-deep pb-8 pt-24 text-white sm:pb-10"
      aria-roledescription="slayder"
      aria-label="Algoritm haqida asosiy takliflar"
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
      {/* Fon slaydlar (crossfade + Ken Burns — Image-First yorqin fotolar) */}
      <div className="absolute inset-0">
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
              className={`h-full w-full object-cover object-center ${idx === currentSlide ? "animate-ken-burns" : ""}`}
            />
            {/* Yengil kinematik qatlamlar — rasm aniq va yorqin ko'rinadi */}
            <div className="absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/25 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-night-deep/80 via-night-deep/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Kontent — Ixcham, toza va rasmga xalaqit bermaydigan */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          key={slide.id}
          aria-live="polite"
          className="max-w-2xl rounded-2xl sm:rounded-3xl bg-slate-950/40 p-5 sm:p-7 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          {/* Yo'nalish belgilari */}
          <div className="animate-fade-up flex flex-wrap items-center gap-2">
            <Link
              href="#maktab"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-brand-400/60 hover:bg-white/15"
            >
              <School className="h-3.5 w-3.5 text-brand-400" />
              0–11 xususiy maktab
            </Link>
            <Link
              href="#kurslar"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-brand-400/60 hover:bg-white/15"
            >
              <GraduationCap className="h-3.5 w-3.5 text-brand-400" />
              PMT · SAT · IELTS kurslari
            </Link>
          </div>

          {/* Kicker */}
          <p className="animate-fade-up mt-3.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-brand-400 [animation-delay:60ms]">
            {slide.kicker}
          </p>

          {/* H1 — Ixchamlashtirilgan, kuchli sarlavha */}
          <h1 className="animate-fade-up mt-2 font-display text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.1rem] [animation-delay:120ms] drop-shadow-sm">
            {slide.title}
          </h1>

          {/* Qisqa tavsif */}
          <p className="animate-fade-up mt-2.5 text-xs leading-relaxed text-slate-200 sm:text-sm max-w-xl [animation-delay:180ms]">
            {slide.desc}
          </p>

          {/* CTA Harakat tugmalari */}
          <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
            <button
              onClick={() => onOpenLeadModal("1 kunlik bepul sinov darsi")}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-glow transition-all duration-200 hover:bg-brand-400 active:scale-[0.98]"
            >
              <span>1 kunlik bepul dars</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="#natijalar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/15"
            >
              Natijalar
            </Link>
          </div>
        </div>

        {/* Pastki boshqaruv paneli (4 soniyalik progress-bar) */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-3.5">
            {/* Raqam */}
            <span className="font-mono text-xs text-slate-400">
              <span className="text-base font-bold text-white">{String(currentSlide + 1).padStart(2, "0")}</span>
              <span className="mx-1">/</span>
              {String(slides.length).padStart(2, "0")}
            </span>

            {/* Indikatorlar */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Slayd ${idx + 1}`}
                  className={`h-1 overflow-hidden rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-9 bg-white/20" : "w-5 bg-white/15 hover:bg-white/30"
                  }`}
                >
                  {idx === currentSlide && !paused && (
                    <span
                      key={`progress-${currentSlide}`}
                      className="block h-full bg-brand-400"
                      style={{ animation: `hero-progress ${SLIDE_INTERVAL}ms linear forwards` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Oldingi slayd"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Keyingi slayd"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mikro-statistika — 3 ta ixcham va asosiy mezon */}
        <div className="mt-4 hidden items-center gap-x-6 gap-y-2 border-t border-white/10 pt-3 md:flex">
          {microStats.map((stat) => (
            <span key={stat.label} className="flex items-center gap-2 text-xs text-slate-300">
              <stat.icon className="h-3.5 w-3.5 text-brand-400" />
              {stat.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
