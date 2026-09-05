"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Utensils, ArrowRight, School, ChevronDown } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

interface SchoolProgramsProps {
  onOpenLeadModal: (programTitle: string) => void;
}

export default function SchoolPrograms({ onOpenLeadModal }: SchoolProgramsProps) {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="bg-slate-50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="maktab">
      <div id="dasturlar"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          eyebrow="Algoritm School"
          eyebrowIcon={School}
          title="0–11 sinf xususiy maktab dasturlari"
          description="0-sinfdan boshlab OTM grantlarigacha bo'lgan uzluksiz, o'zbek va rus tillaridagi chuqurlashtirilgan to'liq kunlik ta'lim bosqichlari."
          wide
          className="mb-16"
        />

        {/* 4 Grade Cards (0-Sinf, 1-4 Sinf, 5-8 Sinf, 9-11 Sinf) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {ECOSYSTEM_DATA.school.programs.map((prog, idx) => {
            const isExpanded = Boolean(expandedMap[prog.id]);

            return (
              <div
                key={prog.id}
                className={`rounded-3xl bg-white border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative group text-left ${
                  idx === 1
                    ? "border-brand-500 ring-2 ring-brand-500/20 shadow-xl"
                    : "border-slate-200 hover:border-brand-400 hover:shadow-lg"
                }`}
              >
                {idx === 1 && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                      Asosiy Qabul
                    </span>
                  </div>
                )}

                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-[11px] font-black uppercase tracking-wider border border-brand-200">
                      {prog.gradeRange}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {prog.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-black text-slate-950 mb-2.5 group-hover:text-brand-700 transition-colors leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {prog.description}
                  </p>

                  {/* Batafsil Toggle Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleExpand(prog.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200/60"
                    >
                      <span>{isExpanded ? "Qisqartirish" : "Batafsil"}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reassurance Timing & Food + Focus Points (Only when expanded) */}
                  {isExpanded && (
                    <div className="pt-1">
                      {/* Reassurance Timing & Food */}
                      <div className="space-y-2 py-3 border-y border-slate-100 mb-4 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>Vaqt: <strong className="text-slate-900">{prog.schedule}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Utensils className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>Taom: <strong className="text-slate-900">{prog.meals}</strong></span>
                        </div>
                      </div>

                      {/* Core Focus Points */}
                      <div className="space-y-2.5 mb-5">
                        {prog.focus.map((item, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-[11.5px] font-semibold text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => onOpenLeadModal(prog.title)}
                    className={`w-full py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                      idx === 1
                        ? "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20"
                        : "bg-slate-950 hover:bg-brand-600 text-white"
                    }`}
                  >
                    <span>Qabulga Yozilish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
