"use client";

import React from "react";
import {
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  Target,
  BookOpen,
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

interface StudentJourneyTimelineProps {
  onOpenLeadModal?: (targetName: string) => void;
}

const JOURNEY_STAGES = [
  {
    step: "01",
    phase: "Boshlang'ich & Tayyorlov Bosqichi",
    grade: "0 – 4 Sinf",
    age: "5 – 10 yosh",
    title: "Mantiqiy Tafakkur, 0-Sinf & PMT Poydevori",
    description:
      "0-sinf maktabgacha tayyorlov (rus va o'zbek guruhlari, Nelya Mamadaliyeva, Irina Artikova) hamda 1–4 boshlang'ich sinflar. Bolada mustaqil fikrlash, tanqidiy tahlil, chuqur matematika va ingliz tili muloqoti shakllantiriladi.",
    milestones: [
      "0-sinfdanoq amaliy Robototexnika, mantiq va aqliy rivojlanish (kvota: 18 ta o'rin)",
      "4-sinf oxiridagi Prezident maktabi (PMT) imtihonlariga 100% intensiv tayyorgarlik",
      "Xalqaro Kenguru, SEAMO va KHISO matematika olimpiadalari g'olibligi",
      "Erkin ingliz tili muloqoti (Speaking) va rus tilida ravon so'zlashuv",
    ],
    outcome: "0-Sinf Tayyorlovi & PMT/Ixtisos Maktablarga Kafolatlangan Kirish",
    theme: {
      color: "emerald",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentBg: "bg-emerald-500",
      glow: "shadow-emerald-500/20",
      border: "hover:border-emerald-400",
      icon: BookOpen,
    },
  },
  {
    step: "02",
    phase: "O'rta Maktab Bosqichi",
    grade: "5 – 8 Sinf",
    age: "11 – 14 yosh",
    title: "Xalqaro Fan Olimpiadalari, CEFR & IT Dasturlash",
    description:
      "Al-Xorazmiy va ixtisoslashtirilgan maktablar chuqur o'quv dasturi. 5–6-sinfdanoq xalqaro til sertifikatlari, aniq fan laboratoriyalari va dasturlash loyihalari.",
    milestones: [
      "5–6-sinfdanoq CEFR B1/B2 va xalqaro IELTS tayyorgarligi",
      "Xalqaro olimpiadalar markazi (IMEC, JSEO, TasIMO) bo'yicha sovrinli o'rinlar",
      "Matematika, fizika laboratoriyalari va Python/Web dasturlash asoslari",
    ],
    outcome: "CEFR B2 Sertifikati & Respublika Olimpiada Sovrinlari",
    theme: {
      color: "blue",
      badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
      accentBg: "bg-blue-500",
      glow: "shadow-blue-500/20",
      border: "hover:border-blue-400",
      icon: Target,
    },
  },
  {
    step: "03",
    phase: "Ilg'or Tayyorlov Bosqichi",
    grade: "9 – 10 Sinf",
    age: "15 – 16 yosh",
    title: "Milliy Sertifikat A+ & Muddatidan Oldin Talabalik",
    description:
      "Maktabning o'zida repetitorsiz OTMga 189 ball maksimal tayyorgarlik. Har oylik nazorat testlari, naqd stipendiyalar va 1 yillik bepul GRAND imtiyozlari.",
    milestones: [
      "Matematika va fanlardan Milliy sertifikat (A+) — OTMga 100% imtiyoz",
      "10-sinfdayoq talabalik maqomini naqd qilish (muddatidan oldin qabul)",
      "7–10 sinflar o'rtasidagi GRAND imtihonida 1 yillik bepul o'qish huquqi",
    ],
    outcome: "10-Sinfdayoq Talabalik Kafolati & Oylik Naqd Stipendiya",
    theme: {
      color: "purple",
      badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
      accentBg: "bg-purple-500",
      glow: "shadow-purple-500/20",
      border: "hover:border-purple-400",
      icon: Award,
    },
  },
  {
    step: "04",
    phase: "Global Zafar Bosqichi",
    grade: "11 Sinf",
    age: "17 – 18 yosh",
    title: "Digital SAT 1500+ & Dunyo Oliygohlariga 100% Grant",
    description:
      "AQSH, Buyuk Britaniya va Yevropaning eng nufuzli universitetlariga SAT 1500+ bilan to'liq $100,000+ lik grant yutish yoki O'zbekiston OTMlariga davlat byudjeti.",
    milestones: [
      "Digital SAT 1400+ va 1500+ natijalari bilan xalqaro universitetlarga grant",
      "IELTS 7.5 – 8.5 akademik darajasi va xalqaro tavsiyanomalar",
      "WIUT, Inha, Webster, CAU yoki xorijiy oliygohlarga 100% grant kafolati",
    ],
    outcome: "Dunyo va O'zbekiston OTMlariga 100% To'liq Grant",
    theme: {
      color: "amber",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
      accentBg: "bg-amber-500",
      glow: "shadow-amber-500/20",
      border: "hover:border-amber-400",
      icon: GraduationCap,
    },
  },
];

export default function StudentJourneyTimeline({ onOpenLeadModal }: StudentJourneyTimelineProps) {
  return (
    <section
      className="bg-slate-50/60 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80 relative overflow-hidden"
      id="maktab"
    >
      <div id="dasturlar" className="scroll-mt-24" />
      <div id="muvaffaqiyat-yoli" className="scroll-mt-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <SectionHeader
          eyebrow="Algoritm School · 0–11 Sinf"
          eyebrowIcon={Compass}
          title="0-sinfdan global grantlargacha: O'quvchining muvaffaqiyat yo'li"
          description="Algoritm School'da ta'lim tasodifiy emas: 0-sinf maktabgacha tayyorlovdan boshlab to 11-sinf bitiruvigacha bo'lgan har bir bosqichda aniq maqsad, xalqaro sertifikat va OTM grantlari strategiyasi belgilangan."
          wide
          className="mb-20"
        />

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Luminous Spine (Desktop markazida, Mobilda chap tomonda) */}
          <div className="absolute top-8 bottom-8 left-6 md:left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 via-purple-500 to-amber-500 rounded-full opacity-30 pointer-events-none" />

          {/* Milestone Items */}
          <div className="space-y-12 sm:space-y-16">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isEven = idx % 2 === 0;
              const IconComp = stage.theme.icon;

              return (
                <div
                  key={stage.step}
                  className="relative flex flex-col md:flex-row items-start md:items-center"
                >
                  {/* Spine Node Marker (Kichik nurli aylanacha) */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-slate-100 shadow-md flex items-center justify-center z-10">
                    <div className={`w-4 h-4 rounded-full ${stage.theme.accentBg} shadow-sm`} />
                  </div>

                  {/* Desktop Alternating layout */}
                  <div
                    className={`w-full pl-16 md:pl-0 ${
                      isEven
                        ? "md:w-1/2 md:pr-14 md:text-right"
                        : "md:w-1/2 md:pl-14 md:ml-auto md:text-left"
                    }`}
                  >
                    <ScrollReveal
                      variant={isEven ? "fade-right" : "fade-left"}
                      delay={idx * 100}
                      duration={750}
                    >
                      <div
                        className={`rounded-3xl bg-white border border-slate-200/90 p-7 sm:p-9 shadow-xs hover:shadow-xl ${stage.theme.border} transition-all duration-300 relative group text-left`}
                      >
                        {/* Header metadata row */}
                        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-900 font-mono font-black text-xs flex items-center justify-center border border-slate-200">
                              {stage.step}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${stage.theme.badgeBg}`}
                            >
                              {stage.grade}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {stage.age}
                          </span>
                        </div>

                        {/* Title & Phase */}
                        <div className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{stage.phase}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-brand-700 transition-colors leading-snug">
                          {stage.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                          {stage.description}
                        </p>

                        {/* Milestones list */}
                        <div className="space-y-2.5 mb-6 pt-5 border-t border-slate-100">
                          {stage.milestones.map((m, mIdx) => (
                            <div key={mIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="font-medium">{m}</span>
                            </div>
                          ))}
                        </div>

                        {/* Result callout box */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Kafolatlangan Natija:</span>
                          </div>
                          <span className="font-bold text-brand-800 text-right">
                            {stage.outcome}
                          </span>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <ScrollReveal variant="fade-up" delay={200} duration={750} className="mt-20">
          <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl">
            <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                1 Kunlik Bepul Sinov Darsi
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Farzandingiz muvaffaqiyat yo'lini bugundan boshlang
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Farzandingiz qaysi sinfda o'qishidan qat'i nazar, maktabimizga kelib 1 kun bepul darsda qatnashishi, o'quv muhiti va 3 mahal taomnoma bilan shaxsan tanishishi mumkin.
              </p>
            </div>

            <button
              onClick={() => onOpenLeadModal?.("11 Yillik Muvaffaqiyat Yo'li — Bepul Sinov")}
              className="relative z-10 px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 flex items-center gap-2.5 shrink-0 cursor-pointer"
            >
              <span>Bepul Sinov Darsiga Yozilish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
