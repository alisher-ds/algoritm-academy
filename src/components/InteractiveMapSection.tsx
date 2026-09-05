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
  Compass,
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

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
      embedUrl: "https://yandex.uz/map-widget/v1/?ll=65.784375%2C38.841000&z=17&pt=65.784375,38.841000,pm2rdm",
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
      embedUrl: "https://yandex.uz/map-widget/v1/?ll=65.79575%2C38.84325&z=17&pt=65.79575,38.84325,pm2vlm",
      icon: GraduationCap,
    },
  };

  const current = campuses[activeCampus];

  return (
    <section className={`py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden ${className}`} id="xarita">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Interaktiv Geografik Xarita</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bizning Binolarimiz & Manzil
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Algoritm ekotizimining Qarshi shahridagi ikkala binosiga tashrif buyuring. Xarita orqali aniq lokatsiyani ko'rishingiz yoki Google Maps va Yandex ilovalari orqali marshrut chizishingiz mumkin.
          </p>

          {/* Campus Switcher Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveCampus("school")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeCampus === "school"
                  ? "bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <School className="w-4 h-4" />
              <span>1-Bino: Algoritm School</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCampus("academy")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeCampus === "academy"
                  ? "bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>2-Bino: Algoritm Academy</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Card & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Info Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-7 sm:p-9 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
                  {current.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
                  {current.plusCode}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-2">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
                {current.subtitle}
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-medium mb-8">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Manzil:</strong>
                    <span>{current.address}</span>
                    <span className="text-xs text-brand-400 block mt-0.5">
                      {current.landmark}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <Phone className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Bog'lanish:</strong>
                    <span className="font-mono text-brand-300 font-bold">{current.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <Clock className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Ish vaqti:</strong>
                    <span>{current.workingHours} (qabul bo'limi ochiq)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Ilovada ochish va yo'l chizish:
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Google Maps Button */}
                <a
                  href={current.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                {/* Yandex Maps Button */}
                <a
                  href={current.yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg"
                >
                  <MapPin className="w-4 h-4 text-slate-950" />
                  <span>Yandex Xarita</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>

              {/* Direct Route / Yandex Go Button */}
              <a
                href={current.yandexRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-slate-950 border border-brand-500/30 font-bold text-xs uppercase tracking-wider transition"
              >
                <Compass className="w-4 h-4" />
                <span>Yo'nalish chizish (Marshrut)</span>
              </a>
            </div>
          </div>

          {/* Right: Embedded Interactive Map */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-900 min-h-[420px] sm:min-h-[500px] flex flex-col relative">
            <iframe
              key={current.id}
              src={current.embedUrl}
              title={`${current.title} xaritasi`}
              className="w-full flex-1 border-0 min-h-[420px] sm:min-h-[500px]"
              loading="lazy"
              allowFullScreen
            />

            {/* Map overlay hint */}
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-medium shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Jonli interaktiv xarita</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
