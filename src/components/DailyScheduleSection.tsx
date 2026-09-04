"use client";

import React from "react";
import { Clock, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

export default function DailyScheduleSection() {
  return (
    <section className="bg-slate-50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="kun-tartibi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
 eyebrow="Tartib va intizom"
 eyebrowIcon={Clock}
 title="Maktabda bir kun (08:00 – 17:00)"
 description="Farzandingiz vaqti behuda ketmaydi: aqliy mashg'ulotlar, sog'lom ovqatlanish va dam olish mutanosib taqsimlangan."
 className="mb-16"
 />

        {/* Schedule Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_DATA.school.dailySchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-brand-400 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200/70 text-xs font-black font-mono">
                    {item.time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
