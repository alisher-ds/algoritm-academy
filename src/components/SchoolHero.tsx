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

const SLIDE_INTERVAL = 6000;

export default function SchoolHero({ onOpenLeadModal }: SchoolHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const touchX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Viewport'dan chiqib ketganda (pastga scroll qilinganda) karuselni to'xtatib turish
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Avtomatik slayd almashishi (6 soniya) — ekran tashqarisida yoki hover/tegish paytida to'xtab turadi
  useEffect(() => {
    if (paused || !isInView) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, isInView, next]);

  // Klaviatura o'qlari — faqat karuselning o'zi fokusda bo'lganda
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [next, prev]);

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className="relative flex h-[85svh] sm:h-[90svh] lg:h-screen min-h-[500px] w-full flex-col justify-end overflow-hidden pb-8 sm:pb-12 lg:pb-16 pt-20 text-white select-none focus:outline-none"
      aria-label="Algoritm ta'lim ekotizimi bosh sahifasi"
      aria-roledescription="karusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
      {/* Sahifa uchun bitta barqaror SEO sarlavhasi */}
      <h1 className="sr-only">
        Algoritm Academy — 0–11 Sinf Xususiy Maktabi va Akademik O&apos;quv Markazi
      </h1>

      {/* Silky-smooth Dual Crossfade: Fotosuratlar va Matn birga yumshoq va tebranmasdan eriydi */}
      <div className="absolute inset-0 z-0 bg-night-deep">
        {slides.map((s, idx) => {
          const isCurrent = idx === currentSlide;
          const isPrev = idx === prevSlide;

          // Joriy slayd (z-20) 1000ms davomida silliq ochiladi.
          // Oldingi slayd (z-10) uning ostida turadi, boshqa slaydlar esa ko'rinmaydi.
          // Hech qanday vertikal sakrash (translateY jitter) bo'lmaydi — faqat shaffoflik (opacity) o'zgaradi.
          const zIndex = isCurrent ? "z-20" : isPrev ? "z-10" : "z-0";
          const opacity = isCurrent ? "opacity-100" : "opacity-0";

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${zIndex} ${opacity}`}
              aria-hidden={!isCurrent}
            >
              {/* Fotosurat (Yumshoq, uzluksiz kinomatografik zoom) */}
              {/* Birinchi slayd — sahifaning LCP elementi: darhol va yuqori prioritet bilan.
                  Qolgan slaydlar lazy — ilgari 4 ta katta JPG bir vaqtda yuklanardi. */}
              <img
                src={s.image}
                alt=""
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "low"}
                decoding={idx === 0 ? "sync" : "async"}
                className={`h-full w-full object-cover object-[center_30%] sm:object-center transition-transform duration-[7000ms] ease-out will-change-transform ${
                  isCurrent ? "scale-105" : "scale-100"
                }`}
              />

              {/* Matn o'qilishi uchun tabiiy vinetka */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

              {/* Matn va tugma — barqaror, tebranmasdan va qimirlamasdan eriydi */}
              <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pointer-events-none">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
                  <div className={`max-w-xl text-left ${isCurrent ? "pointer-events-auto" : "pointer-events-none"}`}>
                    {/* Brend yashil rangidagi ixcham kicker */}
                    <p className="font-bold text-brand-400 text-[11px] sm:text-xs tracking-[0.2em] uppercase drop-shadow-md">
                      {s.kicker}
                    </p>

                    {/* Slayd sarlavhasi (barqaror h2, DOM dan o'chirilmaydi va sakramaydi) */}
                    <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-md">
                      {s.title}
                    </h2>

                    {/* Qisqa va lo'nda tavsif */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-200/90 font-medium max-w-md leading-relaxed drop-shadow-sm">
                      {s.desc}
                    </p>

                    {/* Qabul/Bog'lanish tugmasi */}
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
