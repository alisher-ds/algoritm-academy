"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Send, Globe, School, GraduationCap, Clock } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

const schoolLinks = [
  { href: "/#haqida", label: "Maktab haqida" },
  { href: "/#dasturlar", label: "0–11 sinf dasturlari" },
  { href: "/#sharoitlar", label: "Ovqat, transport, yotoqxona" },
  { href: "/#kun-tartibi", label: "Kun tartibi" },
  { href: "/#natijalar", label: "Akademik natijalar" },
  { href: "/#qabul", label: "Qabul & sinov darsi" },
];

const courseLinks = [
  { href: "/#kurslar", label: "Prezident maktabi (PMT)" },
  { href: "/#kurslar", label: "Digital SAT 1500+" },
  { href: "/#kurslar", label: "IELTS 7.5+ va CEFR" },
  { href: "/#kurslar", label: "Matematika — Milliy A+" },
  { href: "/markaz", label: "O'quv markazi sahifasi" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night-deep text-slate-300">
      {/* Yuqori aksent chizig'i */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />

      {/* Orqa fon glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-4">
            <Link href="/" className="group flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 transition-transform group-hover:scale-105">
                <img src="/logo.png" alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  Algoritm
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-400">
                  Academy
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              0–11 sinf xususiy maktabi hamda Prezident maktabi (PMT), Digital SAT va davlat
              grantlariga tayyorlovni birlashtirgan ta&apos;lim ekotizimi — Qarshi.
            </p>

            <div className="space-y-1.5 text-xs text-slate-500">
              <p>
                Davlat litsenziyasi:{" "}
                <span className="font-semibold text-slate-300">{ECOSYSTEM_DATA.licenseNumber}</span>
              </p>
              <p>
                Ta&apos;lim tili:{" "}
                <span className="font-semibold text-slate-300">O&apos;zbek / Rus</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={ECOSYSTEM_DATA.contact.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href={ECOSYSTEM_DATA.contact.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                aria-label="Instagram"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Maktab havolalari */}
          <nav className="lg:col-span-3" aria-label="Maktab bo'limlari">
            <h4 className="mb-4 flex items-center gap-2 text-[13px] font-bold text-white">
              <School className="h-4 w-4 text-brand-400" />
              Algoritm School
            </h4>
            <ul className="space-y-2.5 text-sm">
              {schoolLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-slate-400 transition-colors hover:text-brand-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kurs havolalari */}
          <nav className="lg:col-span-2" aria-label="Kurs bo'limlari">
            <h4 className="mb-4 flex items-center gap-2 text-[13px] font-bold text-white">
              <GraduationCap className="h-4 w-4 text-brand-400" />
              O'quv markazi
            </h4>
            <ul className="space-y-2.5 text-sm">
              {courseLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-slate-400 transition-colors hover:text-brand-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Aloqa */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="text-[13px] font-bold text-white">Aloqa va manzil</h4>

            <div className="flex items-start gap-2.5 text-sm text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <div>
                <span>{ECOSYSTEM_DATA.contact.address}</span>
                <div className="text-xs text-slate-500 mt-0.5">{ECOSYSTEM_DATA.contact.landmark}</div>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <a
                    href="https://maps.app.goo.gl/Rkv1RmfmowBawY5x5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
                  >
                    Maktab xaritada ↗
                  </a>
                  <span className="text-slate-600">·</span>
                  <a
                    href="https://maps.app.goo.gl/2Grpzgi6X6SeiruA6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
                  >
                    Markaz xaritada ↗
                  </a>
                </div>
              </div>
            </div>

            <p className="flex items-center gap-2.5 text-sm">
              <School className="h-4 w-4 shrink-0 text-brand-400" />
              <a
                href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`}
                className="font-mono text-slate-300 transition-colors hover:text-brand-400"
              >
                {ECOSYSTEM_DATA.school.phone}
              </a>
              <span className="text-xs text-slate-500">— maktab</span>
            </p>
            <p className="flex items-center gap-2.5 text-sm">
              <GraduationCap className="h-4 w-4 shrink-0 text-brand-400" />
              <span className="font-mono text-slate-300">
                {ECOSYSTEM_DATA.contact.phoneMain} · {ECOSYSTEM_DATA.contact.phoneSecondary}
              </span>
              <span className="text-xs text-slate-500">— markaz</span>
            </p>

            <p className="flex items-center gap-2.5 text-sm text-slate-400">
              <Clock className="h-4 w-4 shrink-0 text-brand-400" />
              <span>
                Maktab: {ECOSYSTEM_DATA.school.workingHours}
                <span className="mx-2 text-slate-600">·</span>
                Markaz: {ECOSYSTEM_DATA.academy.workingHours}
              </span>
            </p>
          </div>
        </div>

        {/* Pastki qator */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 Algoritm Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/maktab" className="transition-colors hover:text-slate-200">
              Maktab (0–11)
            </Link>
            <Link href="/markaz" className="transition-colors hover:text-slate-200">
              O'quv markazi
            </Link>
            <Link href="/galereya" className="transition-colors hover:text-slate-200">
              Galereya
            </Link>
            <Link href="/aloqa" className="transition-colors hover:text-slate-200">
              Aloqa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
