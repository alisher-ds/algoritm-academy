"use client";

import React from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  MapPin,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

interface HeroProps {
  onOpenLeadModal: (target?: string) => void;
  onOpenVideoModal: () => void;
  onOpenQuizModal: () => void;
}

export default function Hero({ onOpenLeadModal, onOpenVideoModal, onOpenQuizModal }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 text-slate-900 border-b border-slate-200/80">
      
      {/* Background Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-200/30 to-lime-200/30 blur-3xl pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                1-Dars Bepul Sinov Darsi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Qarshi sh. · Islom Karimov 291V
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.08] text-slate-950">
                Kelajak Liderlari Uchun <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Algoritm Academy
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed pt-2">
                Prezident maktabiga tayyorlov (PMT), SAT 1400+, IELTS 8.0 va Matematika Milliy Sertifikat bo'yicha Qarshi shahridagi eng yuqori natijador innovatsion ta'lim markazi.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenLeadModal("1-Dars Bepul")}
                className="group relative px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/25 transition-all duration-200 flex items-center gap-2.5"
              >
                <span>1-Dars Bepul Joy Olish</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenQuizModal}
                className="px-6 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-xs transition-all flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Yo'nalish Tanlash Testi</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">250+</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">Matematika Milliy sertifikati (A+)</div>
              </div>
              <div className="border-x border-slate-200 px-4">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">Top 1</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">PMT Qabul darajasi</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">98.5%</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">OTM Grantiga kirish</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-2 shadow-xl group">
              
              {/* Image Preview */}
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src="/images/demo/hero_cover.svg"
                  alt="Algoritm Academy Interfaol Darslar"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                {/* Big Center Play Button */}
                <button
                  onClick={onOpenVideoModal}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
                  aria-label="Videoni ko'rish"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>
              </div>

              {/* Bottom Interactive Banner */}
              <div className="p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Prezident Maktabi & SAT Kafolati</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Haftalik bepul mock imtihonlari</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenLeadModal("PMT & SAT Darsiga Yozilish")}
                  className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-black uppercase hover:bg-emerald-500 transition shrink-0 shadow-xs"
                >
                  Yozilish
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
