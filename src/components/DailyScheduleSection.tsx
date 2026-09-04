"use client";

import React from "react";
import { Clock, Coffee, BookOpen, Utensils, Bot, PenLine, Bus } from "lucide-react";
import type { ComponentType } from "react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Coffee,
  BookOpen,
  Utensils,
  Bot,
  PenLine,
  Bus,
};

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
          {ECOSYSTEM_DATA.school.dailySchedule.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || Clock;
            return (
              <div
                key={idx}
                className="group p-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center transition-colors group-hover:bg-brand-500 group-hover:text-white">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold font-mono">
                      {item.time}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

