"use client";

import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Heart, Sparkles, BookOpen, Code, Globe, Cpu } from "lucide-react";

interface SchoolAboutProps {
  onOpenLeadModal: (target?: string) => void;
}

export default function SchoolAbout({ onOpenLeadModal }: SchoolAboutProps) {
  const pillars = [
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      title: "Fundamental Matematika",
      desc: "Xalqaro olimpiada darajasidagi mantiqiy masalalar, analitik va tanqidiy tahlil ko'nikmalari.",
      badge: "Kuchli Akademik Baza",
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      title: "Cambridge Ingliz Tili",
      desc: "Erta yoshdan erkin so'zlashuv, CEFR va IELTS bo'yicha Britaniya metodikasi asosida darslar.",
      badge: "Xalqaro Standart",
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-600" />,
      title: "IT & Robototexnika",
      desc: "Dasturlash asoslari, sun'iy intellekt bilan ishlash va zamonaviy texnologik tafakkur.",
      badge: "Kelajak Kasblari",
    },
    {
      icon: <Heart className="w-6 h-6 text-emerald-600" />,
      title: "Milliy Qadriyat & Tarbiya",
      desc: "Kattalarga hurmat, intizom, notiqlik san'ati va kuchli liderlik fazilatlarini shakllantirish.",
      badge: "Sog'lom Muhit",
    },
  ];

  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="haqida">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Akademiya Falsafasi
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Nega Aynan <span className="text-emerald-600">Algoritm Academy</span>?
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg leading-relaxed">
            Biz o'quvchilarni shunchaki dars yodlashga emas, mustaqil fikrlashga, dunyo miqyosida raqobatlasha olishga va milliy o'zligini saqlagan holda yuksak natijalarga erishishga o'rgatamiz.
          </p>
        </div>

        {/* 4 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    {pillar.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-3 group-hover:text-emerald-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kafolatlangan metodika</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner with Founder Quote */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Muassis Murojaati
            </div>
            <p className="text-base sm:text-lg text-slate-200 font-medium italic leading-relaxed">
              "Bizning maqsadimiz — shunchaki sinfda o'tiradigan emas, kelajakda davlatimiz va dunyo miqyosida yetakchilik qiladigan, o'z fikriga ega kuchli shaxslarni tarbiyalashdir."
            </p>
            <div className="text-xs text-slate-400 font-semibold pt-1">
              Bobur Xaydarov — Algoritm Academy Ta'sischisi
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => onOpenLeadModal("Maktab bilan tanishuv")}
              className="w-full md:w-auto px-7 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Maktab Bilan Tanishuvga Yozilish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
