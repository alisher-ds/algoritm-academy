"use client";

import React from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  MapPin,
  HelpCircle,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface HeroProps {
  onOpenLeadModal: (target?: string) => void;
  onOpenVideoModal: () => void;
  onOpenQuizModal: () => void;
}

const heroStats = [
  { value: "1520", label: "Digital SAT — 2026-yilgi eng yuqori natija" },
  { value: "27", label: "nafar o'quvchi to'liq davlat grantida" },
  { value: "189", label: "OTM kirishda maksimal ball" },
];

export default function Hero({ onOpenLeadModal, onOpenVideoModal, onOpenQuizModal }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50/40 via-white to-white pt-28 sm:pt-32">
      {/* Orqa fon aksenti */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400/15 to-brand-200/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Chap ustun */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                Birinchi dars bepul
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[11px] font-bold text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                Qarshi · Islom Karimov 291V
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem]">
              Prezident maktabi va xalqaro imtihonlarga{" "}
              <span className="text-brand-600">professional tayyorlov</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              PMT, Digital SAT 1500+, IELTS 7.5+ va Matematika milliy sertifikat (A+)
              yo&apos;nalishlarida — har bir o&apos;quvchi uchun shaxsiy o&apos;quv reja va haftalik
              bepul mock imtihonlar.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onOpenLeadModal("1-Dars bepul")}
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.98]"
              >
                Bepul sinov darsiga yozilish
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenQuizModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
              >
                <HelpCircle className="h-4 w-4 text-brand-500" />
                Yo&apos;nalish tanlash testi
              </button>
            </div>

            {/* Tasdiqlangan natijalar */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              {heroStats.map((s, i) => (
                <div key={s.value} className={i === 1 ? "border-x border-slate-200 px-4" : ""}>
                  <div className="font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    {s.value}
                  </div>
                  <p className="mt-1 text-xs font-medium leading-snug text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* O'ng ustun: media karta */}
          <div className="lg:col-span-5">
            <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-2 shadow-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src="/images/slides/slide_2_it_ai_lab.jpg"
                  alt="Algoritm Academy — zamonaviy o'quv xonasi"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                <button
                  onClick={onOpenVideoModal}
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lift transition-transform duration-300 hover:scale-110"
                  aria-label="Videoni ko'rish"
                >
                  <Play className="ml-0.5 h-6 w-6 fill-slate-950" />
                </button>

                <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  Jonli darslar
                </span>
              </div>

              {/* Pastki ma'lumot satri */}
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      Haftalik bepul mock imtihonlar
                    </p>
                    <p className="text-xs text-slate-500">Real imtihon muhitida sinov</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenLeadModal("PMT va SAT darsiga yozilish")}
                  className="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-400"
                >
                  Yozilish
                </button>
              </div>
            </div>

            {/* Kichik ma'lumot: manzil */}
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              <GraduationCap className="h-4 w-4 shrink-0 text-brand-500" />
              {ECOSYSTEM_DATA.academy.address} ({ECOSYSTEM_DATA.academy.landmark})
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
