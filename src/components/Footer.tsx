"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Send, Globe, School, GraduationCap, Phone, ExternalLink } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import ScrollReveal from "@/components/ScrollReveal";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night-deep text-slate-300 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-12 items-center">
            {/* 1. Brand & Tarmoqlar */}
            <div className="lg:col-span-4 space-y-1.5">
              <div className="flex items-center gap-3">
                <Link href="/" className="group flex items-center gap-2" aria-label="Algoritm Academy">
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/15 transition-transform group-hover:scale-105">
                    <img src="/logo.png" alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="font-display text-sm font-extrabold tracking-tight text-white">Algoritm</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-brand-400">Academy</span>
                  </span>
                </Link>

                <div className="flex items-center gap-1.5 ml-1">
                  <a
                    href={ECOSYSTEM_DATA.contact.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-slate-400 ring-1 ring-white/10 hover:bg-brand-500 hover:text-slate-950 transition"
                    aria-label="Telegram"
                  >
                    <Send className="h-3 w-3" />
                  </a>
                  <a
                    href={ECOSYSTEM_DATA.contact.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-slate-400 ring-1 ring-white/10 hover:bg-brand-500 hover:text-slate-950 transition"
                    aria-label="Instagram"
                  >
                    <Globe className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Xususiy maktab (0–11) va O'quv markazi ekotizimi — Qarshi.
              </p>
            </div>

            {/* 2. Yo'nalishlar (Faqat Algoritm School va O'quv Markazi) */}
            <div className="lg:col-span-3 space-y-1 md:border-l md:border-white/10 md:pl-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Yo'nalishlar
              </span>
              <div className="flex flex-col gap-1">
                <Link
                  href="/maktab"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-brand-400 transition-colors"
                >
                  <School className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                  <span>Algoritm School</span>
                </Link>
                <Link
                  href="/kurslar"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-brand-400 transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                  <span>O'quv Markazi</span>
                </Link>
              </div>
            </div>

            {/* 3. Aloqa va manzil */}
            <div className="lg:col-span-5 space-y-1 md:border-l md:border-white/10 md:pl-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Aloqa va manzil
              </span>

              <div className="space-y-1 text-xs text-slate-300">
                {/* 1. Maktab manzili */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                  <a
                    href="https://maps.app.goo.gl/Rkv1RmfmowBawY5x5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-400 transition-colors inline-flex items-center gap-1 text-slate-200 font-medium"
                  >
                    <span>1. Maktab manzili</span>
                    <ExternalLink className="h-3 w-3 text-brand-400 shrink-0" />
                  </a>
                </div>

                {/* 2. O'quv markaz manzili */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                  <a
                    href="https://maps.app.goo.gl/2Grpzgi6X6SeiruA6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-400 transition-colors inline-flex items-center gap-1 text-slate-200 font-medium"
                  >
                    <span>2. O'quv markaz manzili</span>
                    <ExternalLink className="h-3 w-3 text-brand-400 shrink-0" />
                  </a>
                </div>

                {/* Telefonlar */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 pt-0.5 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-brand-400 shrink-0" />
                    <a href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`} className="font-mono text-slate-200 hover:text-brand-400">
                      {ECOSYSTEM_DATA.school.phone}
                    </a>
                    <span className="text-[10px] text-slate-400">— maktab</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-brand-400 shrink-0" />
                    <a href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`} className="font-mono text-slate-200 hover:text-brand-400">
                      {ECOSYSTEM_DATA.contact.phoneMain}
                    </a>
                    <span className="text-[10px] text-slate-400">— markaz</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eng pastki qator: Faqat bitta copyright yozuvi */}
          <div className="mt-3 pt-2.5 border-t border-white/5 text-center text-[11px] text-slate-500">
            <p>© 2026 Algoritm Academy. Barcha huquqlar himoyalangan.</p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}

