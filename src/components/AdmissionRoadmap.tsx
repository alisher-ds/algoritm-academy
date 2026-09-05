"use client";

import React from "react";
import { ArrowRight, UserPlus, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

interface AdmissionRoadmapProps {
  onOpenLeadModal: (target?: string) => void;
}

export default function AdmissionRoadmap({ onOpenLeadModal }: AdmissionRoadmapProps) {
  return (
    <section className="bg-slate-50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="qabul">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          eyebrow="Shaffof qabul 2026"
          eyebrowIcon={UserPlus}
          title="Maktabga qabul bosqichlari"
          description="Algoritm School o'quvchisi bo'lish uchun 4 oddiy va shaffof bosqich."
          className="mb-16"
        />

        {/* 4 Step Roadmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ECOSYSTEM_DATA.school.admissionSteps.map((step, idx) => (
            <ScrollReveal
              key={idx}
              variant="fade-up"
              delay={idx * 120}
              duration={700}
              className="h-full flex"
            >
              <div
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between text-left w-full"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-black text-xl mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Call to Action Bar (Inter Nation style radiant banner) */}
        <ScrollReveal variant="fade-up" delay={200} duration={700}>
          <div className="mt-14 p-8 sm:p-12 rounded-3xl bg-brand-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-600/15">
            <div className="text-left space-y-1">
              <h4 className="text-2xl sm:text-3xl font-black text-white uppercase">Qabul uchun bepul diagnostik testga yoziling</h4>
              <p className="text-xs sm:text-sm text-brand-100 font-medium">Farzandingizning bilim darajasi va qobiliyatini professional baholaymiz.</p>
            </div>
            <button
              onClick={() => onOpenLeadModal("Maktabga qabul arizasi")}
              className="px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition shrink-0 flex items-center gap-2.5 shadow-lg cursor-pointer"
            >
              <span>Arizani To'ldirish</span>
              <ArrowRight className="w-4 h-4 text-brand-400" />
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
