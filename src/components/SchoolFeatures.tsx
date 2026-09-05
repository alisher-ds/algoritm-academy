"use client";

import React from "react";
import {
  ShieldCheck,
  Utensils,
  Bot,
  Trophy,
  Bus,
  Users,
  CheckCircle2,
  Sparkles,
  Clock,
  HeartPulse,
  Award,
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

const extraActivities = [
  { label: "Robototexnika & IT", icon: "🤖" },
  { label: "Shaxmat & Mantiq", icon: "♟️" },
  { label: "Karate & Sport", icon: "🥋" },
  { label: "Speaking Club", icon: "🇬🇧" },
  { label: "Mental Arifmetika", icon: "🧮" },
  { label: "Raqs & Gimnastika", icon: "💃" },
  { label: "Fan Tajribaxonalari", icon: "🧪" },
];

const mealsRoutine = [
  {
    time: "08:00 - 08:30",
    label: "Nonushta",
    desc: "Issiq bo'tqa, pishloq, yangi non va choy",
  },
  {
    time: "13:00 - 14:00",
    label: "To'yimli Tushlik",
    desc: "1- va 2-issiq taom, yangi salat, non",
  },
  {
    time: "16:30 - 17:00",
    label: "Poldnik (2-tushlik)",
    desc: "Mavsumiy mevalar, yangi pishiriq va sharbat",
  },
];

export default function SchoolFeatures() {
  return (
    <section
      className="bg-slate-50/50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80"
      id="sharoitlar"
    >
      <div id="afzalliklar"></div>
      <div id="kun-tartibi"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          eyebrow="Barcha qulayliklar"
          eyebrowIcon={ShieldCheck}
          title="Maktab infratuzilmasi va zamonaviy sharoitlar"
          description="Farzandingizning aqliy yuksalishi, jismoniy salomatligi va xavfsizligi uchun Apple uslubida tizimlashtirilgan sharoitlar vitrinasi."
          className="mb-14"
        />

        {/* Bento Grid layout: 12 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: 15+ Bepul To'garaklar (Hero Bento Card - col-span-7) */}
          <ScrollReveal
            variant="fade-up"
            delay={100}
            duration={750}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-brand-400 transition-all duration-300 flex flex-col justify-between h-full group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-500/10 transition-colors" />

              <div>
                {/* Top header & badges */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    15+ Yo'nalish • 100% Bepul
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-brand-700 transition-colors">
                  15 dan ortiq to'garaklar maktab hududida
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Darsdan so'ng farzandni shahar bo'ylab boshqa to'garaklarga tashib ovora bo'lmaysiz. Zamonaviy IT, aniq fanlar, sport va tillar maktab o'quv dasturi doirasida bepul o'rgatiladi.
                </p>

                {/* Interactive Activity Chips */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6">
                  {extraActivities.map((act) => (
                    <span
                      key={act.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-800 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200/70 transition-all cursor-default"
                    >
                      <span className="text-sm">{act.icon}</span>
                      <span>{act.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom footer badge */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-brand-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  Oliy toifali murabbiylar
                </span>
                <span className="text-slate-500">Soat 14:00 - 15:30 oralig'ida</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Halol Oshxona & 3 Mahal Ovqat (Col-span-5) */}
          <ScrollReveal
            variant="fade-up"
            delay={200}
            duration={750}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between h-full group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    Halol & Sifatli • 3 Mahal
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-emerald-700 transition-colors">
                  Halol Oshxona va 3 Mahal Issiq Ovqat
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  Kun davomida o'quvchining jismoniy va aqliy tetikligini saqlash uchun maxsus nutritionistlar nazoratida tayyorlangan halol, issiq taomnoma.
                </p>

                {/* Routine timeline items */}
                <div className="space-y-2.5 mb-5">
                  {mealsRoutine.map((meal) => (
                    <div
                      key={meal.time}
                      className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {meal.label}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {meal.desc}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-200/80 shrink-0">
                        {meal.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs sm:text-sm text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                O'qish to'lovi ichida bepul taqdim etiladi
              </div>
            </div>
          </ScrollReveal>

          {/* Row 2: 3 Cards (Col-span-4 each) */}

          {/* Card 3: Oylik Naqd Stipendiya & GRAND Dasturi */}
          <ScrollReveal
            variant="fade-up"
            delay={300}
            duration={750}
            className="lg:col-span-4"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between h-full group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    Rag'bat Tizimi
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-amber-700 transition-colors">
                  Oylik Stipendiya & GRAND
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                  Har oy yakunidagi nazorat testlarida o'z sinfida 1-o'rinni egallagan o'quvchilarga maxsus naqd stipendiya beriladi.
                </p>

                <div className="space-y-2 mb-5">
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        1-O'ringa Naqd Mukofot
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Har oy sinf birinchilariga oylik stipendiya
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        1 Yillik Bepul GRAND Granti
                      </div>
                      <div className="text-[11px] text-slate-500">
                        7–10 sinflar uchun yillik grant imtihoni
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                Sog'lom akademik raqobat muhiti
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4: Xavfsiz Transport & Tibbiyot */}
          <ScrollReveal
            variant="fade-up"
            delay={400}
            duration={750}
            className="lg:col-span-4"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between h-full group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Bus className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
                    Xavfsiz Qatnov
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-700 transition-colors">
                  Transport, Shifokor & Pansionat
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                  Qarshi shahri bo'ylab uydan-uygacha xavfsiz avtobus, kunlik pediatr nazorati va viloyatdan kelganlar uchun qulay yotoqxona.
                </p>

                <div className="space-y-2 mb-5">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <Bus className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Qarshi shahri bo'ylab xavfsiz transport</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Kunlik shifokor va hamshira nazorati</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Qulay pansionat (yotoqxona) xizmati</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                24/7 video kuzatuv va to'liq xavfsizlik
              </div>
            </div>
          </ScrollReveal>

          {/* Card 5: Kichik Guruh (Max 15) & Uy Vazifalari */}
          <ScrollReveal
            variant="fade-up"
            delay={500}
            duration={750}
            className="lg:col-span-4"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between h-full group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider">
                    Max 15 O'quvchi
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-indigo-700 transition-colors">
                  Kichik Sinf & Uy Vazifasi
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                  Har bir bolaga alohida individual e'tibor. Barcha uyga vazifalar darsdan so'ng ustozlar nazoratida maktabda to'liq yechiladi.
                </p>

                <div className="space-y-2 mb-5">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Sinfda maksimal 15 kishilik kvota</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Uyga vazifalar soat 16:30 gacha tayyor</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Uyda ortiqcha repetitor darslari bo'lmaydi</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                Oila davrasida tinch va sifatli hordiq
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
