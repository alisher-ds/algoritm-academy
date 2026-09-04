"use client";

import React from "react";
import { Clock, CheckCircle2, Sun, Utensils, BookOpen, Activity } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

export default function DailyScheduleSection() {
  return (
    <section className="bg-slate-50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="kun-tartibi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-emerald-700" /> Tartib & Intizom
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Maktabda Bir Kun (08:00 – 17:00)
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Farzandingiz vaqti behuda ketmaydi: aqliy mashg'ulotlar, sog'lom ovqatlanish va dam olish mutanosib taqsimlangan.
          </p>
        </div>

        {/* Schedule Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_DATA.school.dailySchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-black font-mono">
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
