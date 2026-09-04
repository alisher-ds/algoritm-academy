"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SchoolHero from "@/components/SchoolHero";
import SchoolAbout from "@/components/SchoolAbout";
import SchoolPrograms from "@/components/SchoolPrograms";
import SchoolFeatures from "@/components/SchoolFeatures";
import DailyScheduleSection from "@/components/DailyScheduleSection";
import SchoolResults from "@/components/SchoolResults";
import CourseCatalog from "@/components/CourseCatalog";
import TeacherGrid from "@/components/TeacherGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import AdmissionRoadmap from "@/components/AdmissionRoadmap";
import FAQAccordion from "@/components/FAQAccordion";
import LeadBannerSection from "@/components/LeadBannerSection";
import LeadModal from "@/components/LeadModal";

export default function HomePage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadTarget, setLeadTarget] = useState("Algoritm Academy Qabul 2026");

  const handleOpenLeadModal = (targetName: string = "Algoritm Academy Qabul 2026") => {
    setLeadTarget(targetName);
    setLeadModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. Header with Algoritm Academy identity & Dual-Track Navigation */}
      <Navbar onOpenLeadModal={handleOpenLeadModal} />

      <main className="flex-1">
        {/* 1. Asosiy Hero (Bosh Sahifa & Kinetik Slayder) */}
        <SchoolHero onOpenLeadModal={handleOpenLeadModal} />

        {/* 2. 1-QANOT: 0 – 11 Sinf Xususiy Maktab Dasturlari */}
        <SchoolPrograms onOpenLeadModal={handleOpenLeadModal} />

        {/* 3. Maktab Sharoitlari (3 mahal ovqat, yotoqxona, xavfsiz transport, 15+ to'garak) */}
        <SchoolFeatures />

        {/* 4. Kun Tartibi (08:00 - 17:00 bir kunlik muvozanatli rejim) */}
        <DailyScheduleSection />

        {/* 5. Akademik Natijalar (Ekotizim Faxri: 6 ta rasmiy blok — 600+ OTM, 100+ SAT, 300+ PMT) */}
        <SchoolResults />

        {/* 6. Biz Kimmiz? & Akademiya Missiyasi (Ta'lim falsafasi) */}
        <SchoolAbout onOpenLeadModal={handleOpenLeadModal} />

        {/* 7. 2-QANOT: Algoritm Kurslari (PMT, Digital SAT, IELTS, Matematika A+, DTM) */}
        <CourseCatalog onOpenLeadModal={handleOpenLeadModal} />

        {/* 8. Pedagogik Tarkib & Mentorlar Kengashi (Ustozlar jonli oqimi) */}
        <TeacherGrid
          onSelectTeacherForConsultation={(teacher) =>
            handleOpenLeadModal(`${teacher} bilan suhbat`)
          }
        />

        {/* 9. Ota-onalar Fikri & Samimiy Tavsiyalar */}
        <TestimonialsSection />

        {/* 10. 4 Bosqichli Shaffof Qabul Yo'l Xaritasi */}
        <AdmissionRoadmap onOpenLeadModal={handleOpenLeadModal} />

        {/* 11. Savol-Javoblar (FAQ) */}
        <FAQAccordion categoryFilter="umumiy" />

        {/* 12. Universal Ariza Topshirish Bloki */}
        <LeadBannerSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse={leadTarget}
      />
    </div>
  );
}
