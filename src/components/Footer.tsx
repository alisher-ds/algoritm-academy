"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Send, Globe, School, GraduationCap, Phone, ExternalLink } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

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

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* 1. Brand & Ekotizim */}
          <div className="space-y-4 lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-3">
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

            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-slate-400">
              0–11 sinf xususiy maktabi hamda Prezident maktabi (PMT), Digital SAT va davlat
              grantlariga tayyorlovni birlashtirgan ta&apos;lim ekotizimi — Qarshi.
            </p>

            <div className="space-y-1 text-xs text-slate-500">
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

          {/* 2. Yo'nalishlar (Faqat Algoritm School va O'quv Markazi - tagidagi qo'shimcha yozuvlarsiz) */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">Yo'nalishlar</h4>
            <div className="flex flex-col gap-3 pt-1">
              <Link
                href="/maktab"
                className="group inline-flex items-center gap-2.5 text-sm font-bold text-white hover:text-brand-400 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-slate-950 transition-all">
                  <School className="h-4 w-4" />
                </span>
                <span>Algoritm School</span>
              </Link>

              <Link
                href="/kurslar"
                className="group inline-flex items-center gap-2.5 text-sm font-bold text-white hover:text-brand-400 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-slate-950 transition-all">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span>O'quv Markazi</span>
              </Link>
            </div>
          </div>

          {/* 3. Aloqa va manzil (Maktab manzili link, O'quv markaz manzili link, 1 ta maktab va 1 ta markaz nomeri) */}
          <div className="space-y-4 lg:col-span-4">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">Aloqa va manzil</h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              {/* 1. Maktab manzili (xaritaga link) */}
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a
                  href="https://maps.app.goo.gl/Rkv1RmfmowBawY5x5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors inline-flex items-baseline gap-1 group font-medium"
                >
                  <span>1. Maktab manzili: Qarshi sh., Mustaqillik shoh ko'chasi (Geolog MFY)</span>
                  <ExternalLink className="h-3 w-3 text-brand-400 shrink-0 self-center group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* 2. O'quv markaz manzili (xaritaga link) */}
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a
                  href="https://maps.app.goo.gl/2Grpzgi6X6SeiruA6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors inline-flex items-baseline gap-1 group font-medium"
                >
                  <span>2. O'quv markaz manzili: Qarshi sh., Islom Karimov ko'chasi 291V</span>
                  <ExternalLink className="h-3 w-3 text-brand-400 shrink-0 self-center group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Telefonlar: 1 ta maktab, 1 ta markaz */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <p className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                  <a
                    href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`}
                    className="font-mono text-slate-200 transition-colors hover:text-brand-400"
                  >
                    {ECOSYSTEM_DATA.school.phone}
                  </a>
                  <span className="text-xs text-slate-400">— maktab</span>
                </p>

                <p className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                  <a
                    href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`}
                    className="font-mono text-slate-200 transition-colors hover:text-brand-400"
                  >
                    {ECOSYSTEM_DATA.contact.phoneMain}
                  </a>
                  <span className="text-xs text-slate-400">— markaz</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pastki qator: Faqat bitta copyright yozuvi */}
        <div className="pt-6 text-center text-xs text-slate-500">
          <p>© 2026 Algoritm Academy. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

