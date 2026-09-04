"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  GraduationCap
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

interface CourseCatalogProps {
  onOpenLeadModal: (courseTitle: string) => void;
}

export default function CourseCatalog({ onOpenLeadModal }: CourseCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("hammasi");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "hammasi", label: "Barcha Kurslar" },
    { id: "prezident-maktabi", label: "Prezident Maktabi (PMT)" },
    { id: "aniq-fanlar", label: "Matematika & DTM" },
    { id: "tillar", label: "SAT & IELTS" },
  ];

  const filteredCourses = ECOSYSTEM_DATA.courses.filter((course) => {
    const matchesCategory =
      activeCategory === "hammasi" || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.mentor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="bg-night-deep py-20 sm:py-28 text-white border-b border-brand-500/10" id="kurslar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <SectionHeader dark eyebrow="O'quv markazi kurslari" eyebrowIcon={GraduationCap} title="Akademik tayyorlov va grant kurslari" description="Prezident maktabiga tayyorlov (PMT), Digital SAT 1500+, IELTS 7.5+, Matematika milliy sertifikat (A+) va DTM grant repetitorlik dasturlari. Har bir kurs uchun 1-dars mutlaqo bepul." />

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fan yoki yo'nalish bo'yicha qidirish..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 focus:bg-white/[0.07] transition shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-brand-400 text-slate-950 shadow-[0_2px_15px_rgba(0,230,118,0.35)]"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group rounded-3xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-brand-500/40 hover:bg-white/[0.04] hover:shadow-[0_10px_35px_rgba(0,200,83,0.15)] transition-all duration-300 relative overflow-hidden text-left"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                    {course.categoryLabel}
                  </span>
                  {course.badge && (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold">
                      {course.badge}
                    </span>
                  )}
                </div>

                {/* Course Title & Description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Davomiyligi: <strong className="text-white">{course.duration}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="truncate">{course.weeklyHours}</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2.5 mb-6">
                  {course.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom mentor & Action */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kafedra Mudiri / Murabbiy</span>
                    <h4 className="text-xs font-bold text-white">{course.mentor.name}</h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    ★ {course.mentor.rating}
                  </span>
                </div>

                <button
                  onClick={() => onOpenLeadModal(course.title)}
                  className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-brand-400 text-white hover:text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-white/10 hover:border-transparent flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Birinchi darsga yozilish (Bepul)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Guarantee Note */}
        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium text-left">
            <Sparkles className="w-5 h-5 text-brand-400 shrink-0" />
            <span>Har bir o'quvchi birinchi bepul darsda qatnashib, o'z bilim darajasini bepul diagnostika qildirishi mumkin.</span>
          </div>
          <button
            onClick={() => onOpenLeadModal("Kurslar umumiy konsultatsiya")}
            className="text-brand-400 hover:underline font-bold shrink-0"
          >
            Bepul konsultatsiya olish →
          </button>
        </div>

      </div>
    </section>
  );
}
