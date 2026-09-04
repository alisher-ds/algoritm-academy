"use client";

import React from "react";
import { Utensils, Bus, BookOpen, Activity, ShieldCheck, Sparkles, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-6 h-6 text-emerald-600" />,
  Bus: <Bus className="w-6 h-6 text-emerald-600" />,
  BookOpen: <BookOpen className="w-6 h-6 text-emerald-600" />,
  Activity: <Activity className="w-6 h-6 text-emerald-600" />,
};

export default function SchoolFeatures() {
  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="sharoitlar">
      <div id="afzalliklar"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Barcha Qulayliklar
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Maktab Imkoniyatlari & Sharoitlar
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            O'quvchining jismoniy, ruhiy va aqliy salomatligi uchun to'liq yaratilgan zamonaviy infratuzilma.
          </p>
        </div>

        {/* 4 Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ECOSYSTEM_DATA.school.features.map((feat) => (
            <div
              key={feat.id}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-white hover:shadow-lg transition-all duration-300 group flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    {iconMap[feat.icon] || <Sparkles className="w-6 h-6 text-emerald-600" />}
                  </div>
                  {feat.badge && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-200/70">
                      {feat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-950 mb-3 group-hover:text-emerald-700 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
