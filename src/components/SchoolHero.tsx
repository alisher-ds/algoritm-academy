"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, School, GraduationCap, Users, Award, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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
    image: "/images/slides/slide_1_gold_brand.jpg",
    kicker: "Algoritm — ta'lim ekotizimi",
    title: "Xususiy maktab va akademik kurslar",
    desc: "0–11 sinf to'liq kunlik xususiy maktab hamda Prezident maktabi (PMT), Digital SAT, IELTS va davlat grantlariga tayyorlov — Qarshi shahrida, tasdiqlangan natijalar bilan.",
  },
  {
    id: 2,
    image: "/images/slides/slide_3_cambridge_room.jpg",
    kicker: "Natijalar 2026",
    title: "SAT 1520 — 27 nafar davlat granti",
    desc: "Digital SAT bo'yicha 1520 ball va OTM kirishda 189.0 maksimal ball. 27 nafar o'quvchi to'rt yillik to'liq davlat granti bilan o'qishga qabul qilindi.",
  },
  {
    id: 3,
    image: "/images/slides/slide_6_campus_hall.jpg",
    kicker: "Algoritm School",
    title: "0–11 sinf — chuqurlashtirilgan ta'lim",
    desc: "To'liq kunlik rejim, 3 mahal halol issiq ovqat, 15+ bepul to'garak, doimiy shifokor nazorati hamda yotoqxona va xavfsiz transport xizmati.",
  },
  {
    id: 4,
    image: "/images/slides/slide_2_it_ai_lab.jpg",
    kicker: "IT va sun'iy intellekt",
    title: "Robototexnika laboratoriyasi",
    desc: "0-sinfdanoq amaliy robototexnika mashg'ulotlari: Python, C++ va zamonaviy texnologiyalarni maktab yoshidanoq chuqur o'rganish.",
  },
  {
    id: 5,
    image: "/images/slides/slide_5_live_class.jpg",
    kicker: "Xalqaro olimpiadalar markazi",
    title: "KHISO · IMEC · JSEO sovrindorlari",
    desc: "Maktab binosida xalqaro olimpiadalar (KHISO, IMEC, JSEO, TasIMO) o'tkaziladi. O'quvchilarimiz respublika va xalqaro bosqichlarda g'oliblikni qo'lga kiritadi.",
  },
  {
    id: 6,
    image: "/images/slides/slide_4_primary_circle.png",
    kicker: "Individual yondashuv",
    title: "Qat'iy 15 nafarlik sinf kvotasi",
    desc: "Har bir sinfda ko'pi bilan 15 o'quvchi — shaxsiy e'tibor, oylik monitoring, stipendiya va 7–10 sinflar uchun yillik GRAND imtihoni.",
  },
];

const microStats = [
  { icon: Users, label: "Sinfda maksimal 15 o'quvchi" },
  { icon: Award, label: "Xalqaro olimpiadalar markazi" },
  { icon: Sparkles, label: "3 mahal halol issiq ovqat" },
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

  // Avtomatik slayd — hover'da pauza
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
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-night-deep pb-12 pt-28 text-white sm:pb-14"
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
      {/* Fon slaydlar (crossfade + Ken Burns) */}
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
              className={`h-full w-full object-cover ${idx === currentSlide ? "animate-ken-burns" : ""}`}
            />
            {/* Kinematik qatlamlar — image-first: fotolar yorqin va aniq ko'rinadi */}
            <div className="absolute inset-0 bg-gradient-to-t from-night-deep via-night-deep/35 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-night-deep/85 via-night-deep/45 to-transparent" />
          </div>
        ))}
      </div>

      {/* Kontent */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div key={slide.id} aria-live="polite" className="max-w-3xl">
          {/* Yo'nalish belgilari */}
          <div className="animate-fade-up flex flex-wrap items-center gap-2.5">
            <Link
              href="#dasturlar"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-brand-400/60 hover:bg-white/15"
            >
              <School className="h-3.5 w-3.5 text-brand-400" />
              0–11 xususiy maktab
            </Link>
            <Link
              href="#kurslar"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-brand-400/60 hover:bg-white/15"
            >
              <GraduationCap className="h-3.5 w-3.5 text-brand-400" />
              PMT · SAT · IELTS kurslari
            </Link>
          </div>

          {/* Kicker */}
          <p className="animate-fade-up mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-400 [animation-delay:60ms]">
            {slide.kicker}
          </p>

          {/* H1 — brend darajasidagi kuchli sarlavha (uppercase) */}
          <h1 className="animate-fade-up mt-4 font-display text-[1.65rem] font-extrabold uppercase leading-[1.14] tracking-tight text-white sm:text-4xl lg:text-[2.9rem] lg:leading-[1.1] xl:text-[3.3rem] [animation-delay:120ms]">
            {slide.title}
          </h1>

          {/* Desc */}
          <p className="animate-fade-up mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base [animation-delay:180ms]">
            {slide.desc}
          </p>

          {/* CTA */}
          <div className="animate-fade-up mt-7 flex flex-wrap items-center gap-3.5 [animation-delay:240ms]">
            <button
              onClick={() => onOpenLeadModal("Birinchi bepul sinov darsi")}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-brand-500 px-7 py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-glow transition-all duration-200 hover:bg-brand-400 active:scale-[0.98] sm:text-sm"
            >
              <span>1 kunlik bepul sinov darsi</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="#natijalar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/15"
            >
              Natijalar 2026
            </Link>
          </div>
        </div>

        {/* Pastki boshqaruv paneli */}
        <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-4">
            {/* Raqam */}
            <span className="font-mono text-xs text-slate-400">
              <span className="text-lg font-bold text-white">{String(currentSlide + 1).padStart(2, "0")}</span>
              <span className="mx-1.5">/</span>
              {String(slides.length).padStart(2, "0")}
            </span>

            {/* Indikatorlar */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Slayd ${idx + 1}`}
                  className={`h-1 overflow-hidden rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-10 bg-white/20" : "w-6 bg-white/15 hover:bg-white/30"
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

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Oldingi slayd"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Keyingi slayd"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mikro-statistika — faqat desktop */}
        <div className="mt-6 hidden items-center gap-x-7 gap-y-2 border-t border-white/10 pt-4 md:flex">
          {microStats.map((stat) => (
            <span key={stat.label} className="flex items-center gap-2 text-xs text-slate-400">
              <stat.icon className="h-4 w-4 text-brand-400" />
              {stat.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
