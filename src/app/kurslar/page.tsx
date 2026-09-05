"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Flame, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Award
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCatalog from "@/components/CourseCatalog";
import FAQAccordion from "@/components/FAQAccordion";
import LeadBannerSection from "@/components/LeadBannerSection";
import LeadModal from "@/components/LeadModal";
import DiagnosticQuizModal from "@/components/DiagnosticQuizModal";

export default function KurslarPage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadTarget, setLeadTarget] = useState("Prezident Maktabiga Tayyorlov (PMT)");
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const handleOpenLeadModal = (courseName: string = "Prezident Maktabiga Tayyorlov (PMT)") => {
    setLeadTarget(courseName);
    setLeadModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-brand-500 selection:text-slate-950">
      {/* 1. Header & Navigation */}
      <Navbar onOpenLeadModal={handleOpenLeadModal} />

      <main className="flex-1">
        {/* 2. Hero Section dedicated to Course Catalog */}
        <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-night-deep to-night-deep">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
              <Link href="/" className="hover:text-brand-400 transition-colors">
                Bosh sahifa
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-brand-400">Barcha Kurslar & Dars Jadvallari</span>
            </div>

            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 text-brand-300 text-xs font-bold border border-brand-500/30 mb-6 shadow-[0_0_20px_rgba(0,230,118,0.2)]">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>2026-Mavsum Qabuli Ochiq: 8 ta yangi guruh shakllantirildi</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                Algoritm Ta'lim Markazi Kurslari va{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
                  Dars Jadvallari
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                Prezident maktabi, SAT, Tibbiyot, Aniq fanlar, Tillar va Gumanitar yo'nalishlarda Milliy sertifikat (A+) hamda 0 dan noldan boshlovchilar uchun guruhlar. Darslar tajribali bosh murabbiylar tomonidan olib boriladi.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#kurslar"
                  className="px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-brand-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>Kurslarni Ko'rish</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setQuizModalOpen(true)}
                  className="px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 hover:border-brand-400/50 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Darajani Aniqlash (Test)</span>
                </button>
              </div>
            </div>

            {/* Quick value props pill bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1-Dars Mutlaqo Bepul</h4>
                  <p className="text-[11px] text-slate-400">Sinov darsida qatnashing</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">0 dan va Sertifikat</h4>
                  <p className="text-[11px] text-slate-400">Har bir darajaga alohida</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">2 ta Maxsus Filial</h4>
                  <p className="text-[11px] text-slate-400">Markaz & Huquq|Tarix</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kafolatlangan Sifat</h4>
                  <p className="text-[11px] text-slate-400">TOP mentorlar nazorati</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Main Course Catalog Component (with search, category filter pills, cards with timetable) */}
        <CourseCatalog onOpenLeadModal={handleOpenLeadModal} compact={false} />

        {/* 4. FAQ Section */}
        <div className="bg-slate-900 border-t border-white/10">
          <FAQAccordion categoryFilter="markaz" />
        </div>

        {/* 5. Lead Banner Section */}
        <LeadBannerSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse={leadTarget}
      />

      <DiagnosticQuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        onSelectCourse={(course) => handleOpenLeadModal(course)}
      />
    </div>
  );
}
