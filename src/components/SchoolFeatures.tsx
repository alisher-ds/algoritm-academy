"use client";

import React from "react";
import { Utensils, Bus, BookOpen, Activity, ShieldCheck, Sparkles, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-6 h-6 text-brand-600" />,
  Bus: <Bus className="w-6 h-6 text-brand-600" />,
  BookOpen: <BookOpen className="w-6 h-6 text-brand-600" />,
  Activity: <Activity className="w-6 h-6 text-brand-600" />,
};

export default function SchoolFeatures() {
  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="sharoitlar">
      <div id="afzalliklar"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
 eyebrow="Barcha qulayliklar"
 eyebrowIcon={ShieldCheck}
 title="Maktab imkoniyatlari va sharoitlar"
 description="O'quvchining jismoniy, ruhiy va aqliy salomatligi uchun to'liq yaratilgan zamonaviy infratuzilma."
 className="mb-16"
 />

        {/* 4 Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ECOSYSTEM_DATA.school.features.map((feat) => (
            <div
              key={feat.id}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-400 hover:bg-white hover:shadow-lg transition-all duration-300 group flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-brand-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    {iconMap[feat.icon] || <Sparkles className="w-6 h-6 text-brand-600" />}
                  </div>
                  {feat.badge && (
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-[10px] font-extrabold uppercase border border-brand-200/70">
                      {feat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-950 mb-3 group-hover:text-brand-700 transition-colors">
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
