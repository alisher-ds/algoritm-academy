"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight,
  School,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AcademyHeroProps {
  onOpenLeadModal: (targetName?: string) => void;
  onOpenVideoModal?: () => void;
}

export default function SchoolHero({ onOpenLeadModal }: AcademyHeroProps) {
  const slides = [
    {
      id: 1,
      image: "/images/slides/slide_1_gold_brand.jpg",
      highlightTitle: "ALGORITM ACADEMY",
      mainTitle: "XUSUSIY MAKTAB & AKADEMIK KURSLAR",
      desc: "1-11 sinf to'liq kunlik xususiy maktabi hamda Prezident maktabi, Digital SAT, IELTS va Davlat grantlariga Qarshidagi yetakchi tayyorlov ekotizimi.",
    },
    {
      id: 2,
      image: "/images/slides/slide_3_cambridge_room.jpg",
      highlightTitle: "PREZIDENT MAKTABI & SAT",
      mainTitle: "KAFOLATLANGAN NATIJA VA GRANTLAR",
      desc: "100+ SAT 1200+ natija, 300+ ixtisoslashtirilgan maktablar va 150+ to'liq davlat granti ko'rsatkichlari.",
    },
    {
      id: 3,
      image: "/images/slides/slide_4_primary_circle.png",
      highlightTitle: "ALGORITM SCHOOL",
      mainTitle: "1 – 11 CHUQURLASHTIRILGAN TA'LIM",
      desc: "To'liq kunlik rejim (08:00–17:00), 3 mahal halol issiq ovqat, 15+ bepul to'garak va barcha uy vazifalari maktabda.",
    },
    {
      id: 4,
      image: "/images/slides/slide_2_it_ai_lab.jpg",
      highlightTitle: "IT & SUN'IY INTELLEKT",
      mainTitle: "ROBOTOTEXNIKA LABORATORIYASI",
      desc: "Python, C++, Java va amaliy texnologiyalarni maktab yoshidanoq chuqur o'rganish.",
    },
    {
      id: 5,
      image: "/images/slides/slide_5_live_class.jpg",
      highlightTitle: "KICHIK GURUHLAR",
      mainTitle: "MAKSIMAL 15 O'QUVCHI SINFDA",
      desc: "Har bir o'quvchining qobiliyatiga individual yondashuv, haftalik monitoring va mustahkam intizom.",
    },
    {
      id: 6,
      image: "/images/slides/slide_6_campus_hall.jpg",
      highlightTitle: "ZAMONAVIY SHAROIT",
      mainTitle: "YOTOQXONA & XAVFSIZ TRANSPORT",
      desc: "Uzoqdan kelganlar uchun qulay pansionat va Qarshi shahri bo'ylab xavfsiz avtobus qatnovi.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full min-h-[90vh] sm:min-h-screen flex items-end pb-12 sm:pb-16 pt-28 sm:pt-32 overflow-hidden bg-night-deep text-white">
      
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.mainTitle}
              className="w-full h-full object-cover object-center"
            />
            
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-night-deep/95 via-night-deep/40 to-night-deep/60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-night-deep/90 via-night-deep/40 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="max-w-3xl text-left space-y-4 sm:space-y-5">
          
          {/* Dual-Track Selector Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <a
              href="#maktab"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              <School className="w-3.5 h-3.5 text-brand-400" />
              <span>1–11 Xususiy Maktab</span>
            </a>
            <a
              href="#kurslar"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              <span>O'quv Markazi Kurslari</span>
            </a>
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <div className="text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-brand-400 leading-none">
              {slides[currentSlide].highlightTitle}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {slides[currentSlide].mainTitle}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-2xl">
            {slides[currentSlide].desc}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => onOpenLeadModal("Birinchi bepul darsga yozilish")}
              className="px-7 py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 flex items-center gap-2"
            >
              <span>Birinchi bepul darsga yozilish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a
              href="#natijalar"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
            >
              Natijalar bilan tanishish
            </a>
          </div>

        </div>

        {/* Bottom Slide Indicators & Controls */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-8 bg-brand-400" : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              aria-label="Oldingi slayd"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              aria-label="Keyingi slayd"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
