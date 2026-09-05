"use client";

import React from "react";
import { Clock, Coffee, BookOpen, Utensils, Bot, PenLine, Bus } from "lucide-react";
import type { ComponentType } from "react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

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
    <section className="bg-slate-50 py-12 sm:py-16 text-slate-900 border-b border-slate-200/80" id="kun-tartibi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          eyebrow="Tartib va intizom"
          eyebrowIcon={Clock}
          title="Maktabda bir kun (08:00 – 17:00)"
          description="Farzandingiz vaqti behuda ketmaydi: aqliy mashg'ulotlar, sog'lom ovqatlanish va dam olish mutanosib taqsimlangan."
          className="mb-8 sm:mb-10"
        />

        {/* Schedule Timeline Grid - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {ECOSYSTEM_DATA.school.dailySchedule.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || Clock;
            return (
              <ScrollReveal
                key={idx}
                variant="fade-up"
                delay={idx * 60}
                duration={650}
                className="h-full flex"
              >
                <div
                  className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-brand-500 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between w-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center transition-colors group-hover:bg-brand-500 group-hover:text-white shrink-0">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] sm:text-xs font-bold font-mono">
                        {item.time}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

