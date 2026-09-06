"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  School,
  GraduationCap,
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import ScrollReveal from "@/components/ScrollReveal";

interface InteractiveMapSectionProps {
  className?: string;
  defaultCampus?: "school" | "academy";
}

export default function InteractiveMapSection({
  className = "",
  defaultCampus = "school",
}: InteractiveMapSectionProps) {
  const [activeCampus, setActiveCampus] = useState<"school" | "academy">(defaultCampus);

  const campuses = {
    school: {
      id: "school",
      title: "1-Bino: Algoritm School",
      subtitle: "Xususiy Maktab (0 – 11 sinflar)",
      badge: "Maktab Binosi",
      address: ECOSYSTEM_DATA.school.address,
      landmark: ECOSYSTEM_DATA.school.landmark,
      phone: ECOSYSTEM_DATA.school.phone,
      workingHours: ECOSYSTEM_DATA.school.workingHours,
      plusCode: "RQRM+CQ6 Qarshi",
      googleMapsUrl: "https://maps.app.goo.gl/Rkv1RmfmowBawY5x5",
      yandexMapsUrl: "https://yandex.uz/maps/?pt=65.784375,38.841000&z=17&l=map",
      yandexRouteUrl: "https://yandex.uz/maps/?rtext=~38.841000,65.784375&rtt=auto",
      embedUrl:
        "https://yandex.uz/map-widget/v1/?ll=65.784375%2C38.841000&z=17&pt=65.784375,38.841000,pm2rdm",
      icon: School,
    },
    academy: {
      id: "academy",
      title: "2-Bino: Algoritm Academy",
      subtitle: "Repetitorlik & O'quv Markazi",
      badge: "O'quv Markazi",
      address: ECOSYSTEM_DATA.academy.address,
      landmark: ECOSYSTEM_DATA.academy.landmark,
      phone: `${ECOSYSTEM_DATA.academy.phone} / ${ECOSYSTEM_DATA.academy.phoneSecondary}`,
      workingHours: ECOSYSTEM_DATA.academy.workingHours,
      plusCode: "RQVW+883 Qarshi",
      googleMapsUrl: "https://maps.app.goo.gl/2Grpzgi6X6SeiruA6",
      yandexMapsUrl: "https://yandex.uz/maps/?pt=65.79575,38.84325&z=17&l=map",
      yandexRouteUrl: "https://yandex.uz/maps/?rtext=~38.84325,65.79575&rtt=auto",
      embedUrl:
        "https://yandex.uz/map-widget/v1/?ll=65.79575%2C38.84325&z=17&pt=65.79575,38.84325,pm2rdm",
      icon: GraduationCap,
    },
  };

  const current = campuses[activeCampus];

  return (
    <section
      id="manzil"
      className={`relative py-14 sm:py-20 bg-slate-950 text-white overflow-hidden border-t border-white/10 ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header — Ixcham va toza (Interaktiv geografik xarita beydjisiz) */}
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Bizning Binolarimiz & Manzil
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Algoritm ekotizimining Qarshi shahridagi binolari lokatsiyasi va qulay marshrutlar.
            </p>

            {/* Campus Switcher Tabs — Ixchamlashtirilgan */}
            <div className="mt-4 inline-flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveCampus("school")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  activeCampus === "school"
                    ? "bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>1-Bino: Algoritm School</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCampus("academy")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  activeCampus === "academy"
                    ? "bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>2-Bino: Algoritm Academy</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Main Grid: Card & Map — Ixchamlashtirilgan balandlik */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Info Card */}
          <ScrollReveal variant="fade-up" delay={100} duration={700} className="lg:col-span-5 h-full flex flex-col">
            <div className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-xl h-full w-full">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] font-bold uppercase tracking-wider">
                    {current.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {current.plusCode}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-1">
                  {current.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4 font-medium">
                  {current.subtitle}
                </p>

                <div className="space-y-2 text-xs text-slate-300 font-medium mb-4">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Manzil:</strong>
                      <span>{current.address}</span>
                      <span className="text-[11px] text-brand-400 block mt-0.5">
                        {current.landmark}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                    <div className="flex items-center gap-2">
                      <strong className="text-white">Bog'lanish:</strong>
                      <span className="font-mono text-brand-300 font-bold">{current.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                    <div className="flex items-center gap-2">
                      <strong className="text-white">Ish vaqti:</strong>
                      <span>{current.workingHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Route Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <a
                  href={current.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition border border-white/10"
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-400" />
                  <span>Google Xarita</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <a
                  href={current.yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-950" />
                  <span>Yandex Xarita</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Embedded Interactive Map — Ixchamlashtirilgan va Taniqli Qizil Metka + "Algoritm" yorlig'i */}
          <ScrollReveal variant="fade-up" delay={200} duration={700} className="lg:col-span-7 h-full flex flex-col">
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-slate-900 h-[280px] sm:h-[320px] md:h-[340px] flex flex-col relative w-full">
              <iframe
                key={current.id}
                src={current.embedUrl}
                title={`${current.title} xaritasi`}
                className="w-full h-full border-0"
                loading="lazy"
                allow="fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
              />

            {/* Metka endi Yandex widget'ining o'zida chiziladi (`&pt=` parametri).
                Ilgari u iframe markaziga CSS bilan qotirilgan edi — foydalanuvchi
                xaritani surganda metka joyida qolib, BOSHQA manzilni "Algoritm"
                deb ko'rsatardi. */}

            {/* Map overlay indicator */}
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-medium shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Jonli xarita</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
      </div>
    </section>
  );
}

