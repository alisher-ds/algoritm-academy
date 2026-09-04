"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, School, GraduationCap, Users, Sparkles, Award } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface SchoolHeroProps {
  onOpenLeadModal: (targetName?: string) => void;
}

const HERO_VIDEO = "/videos/aziz_teacher_intro.mp4";
const HERO_POSTER = "/images/slides/slide_5_live_class.jpg";

const microStats = [
  { icon: Users, label: "Sinfda maksimal 15 o'quvchi" },
  { icon: Award, label: "Xalqaro olimpiadalar markazi" },
  { icon: Sparkles, label: "3 mahal halol issiq ovqat" },
];

export default function SchoolHero({ onOpenLeadModal }: SchoolHeroProps) {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-night-deep pb-20 pt-32 text-white">
      {/* Video fon (avto-o'ynash, ovozsiz, loop) — poster sifatida real dars fotosi */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />

      {/* Overlay: matn o'qilishi uchun yumshoq gradientlar */}
      <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/85 to-night-deep/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-night-deep via-transparent to-night-deep/60" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Yo'nalish belgilari */}
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <Link
              href="/#dasturlar"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur transition hover:border-brand-400/60 hover:text-brand-400"
            >
              <School className="h-3.5 w-3.5 text-brand-400" />
              0–11 xususiy maktab
            </Link>
            <Link
              href="/#kurslar"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur transition hover:border-brand-400/60 hover:text-brand-400"
            >
              <GraduationCap className="h-3.5 w-3.5 text-brand-400" />
              PMT · SAT · IELTS kurslari
            </Link>
          </div>

          {/* Asosiy sarlavha */}
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Kelajak egalari uchun{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
              zamonaviy ta&apos;lim
            </span>{" "}
            — Qarshida
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            0–11 sinf to&apos;liq kunlik xususiy maktab hamda Prezident maktabi (PMT), Digital SAT,
            IELTS va davlat grantlariga tayyorlov — bitta manzilda, tasdiqlangan natijalar bilan.
          </p>

          {/* CTA tugmalari */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => onOpenLeadModal("Birinchi bepul darsga yozilish")}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.98]"
            >
              Birinchi bepul darsga yozilish
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="/#natijalar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Natijalar bilan tanishish
            </Link>
          </div>

          {/* Mikro-statistika */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-slate-300">
            {microStats.map((s) => (
              <span key={s.label} className="flex items-center gap-2.5">
                <s.icon className="h-4 w-4 shrink-0 text-brand-400" />
                {s.label}
              </span>
            ))}
            <span className="text-slate-500">· Litsenziya {ECOSYSTEM_DATA.licenseNumber}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
