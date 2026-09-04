"use client";

import React from "react";
import { ArrowRight, UserPlus, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface AdmissionRoadmapProps {
  onOpenLeadModal: (target?: string) => void;
}

export default function AdmissionRoadmap({ onOpenLeadModal }: AdmissionRoadmapProps) {
  return (
    <section className="bg-slate-50 py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="qabul">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <UserPlus className="w-3.5 h-3.5 text-emerald-700" /> Shaffof Qabul 2026
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Maktabga Qabul Bosqichlari
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Algoritm School o'quvchisi bo'lish uchun 4 oddiy va shaffof bosqich.
          </p>
        </div>

        {/* 4 Step Roadmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ECOSYSTEM_DATA.school.admissionSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between text-left"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-xl mb-6">
                  0{step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-2.5">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Bar (Inter Nation style radiant banner) */}
        <div className="mt-14 p-8 sm:p-12 rounded-3xl bg-emerald-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-600/15">
          <div className="text-left space-y-1">
            <h4 className="text-2xl sm:text-3xl font-black text-white uppercase">Qabul uchun bepul diagnostik testga yoziling</h4>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">Farzandingizning bilim darajasi va qobiliyatini professional baholaymiz.</p>
          </div>
          <button
            onClick={() => onOpenLeadModal("Maktabga qabul arizasi")}
            className="px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition shrink-0 flex items-center gap-2.5 shadow-lg"
          >
            <span>Arizani To'ldirish</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
