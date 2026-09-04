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
import VideoModal from "@/components/VideoModal";

export default function HomePage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadTarget, setLeadTarget] = useState("Algoritm Academy Qabul 2026");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleOpenLeadModal = (targetName: string = "Algoritm Academy Qabul 2026") => {
    setLeadTarget(targetName);
    setLeadModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. Header with Algoritm Academy identity & Dual-Track Navigation */}
      <Navbar onOpenLeadModal={handleOpenLeadModal} />

      <main className="flex-1">
        {/* 2. Flagship Academy Hero (School + Courses Dual Tracks) */}
        <SchoolHero
          onOpenLeadModal={handleOpenLeadModal}
          onOpenVideoModal={() => setVideoModalOpen(true)}
        />

        {/* 3. Ekotizimning 6 Ta Tasdiqlangan Natijasi (School + Academy 80%) */}
        <SchoolResults />

        {/* 4. Biz Kimmiz? & Akademiya Missiyasi */}
        <SchoolAbout onOpenLeadModal={handleOpenLeadModal} />

        {/* 5. 1-QANOT: 0 – 11 Sinf Xususiy Maktab Dasturlari */}
        <SchoolPrograms onOpenLeadModal={handleOpenLeadModal} />

        {/* 6. Maktab Sharoitlari (3 mahal taom, yotoqxona, xavfsiz transport, 15+ to'garaklar) */}
        <SchoolFeatures />

        {/* 7. Kun Tartibi (08:00 - 17:00) */}
        <DailyScheduleSection />

        {/* 8. 2-QANOT: Algoritm Kurslari (PMT, Digital SAT, IELTS, Matematika A+, DTM) */}
        <CourseCatalog onOpenLeadModal={handleOpenLeadModal} />

        {/* 9. Pedagogik Tarkib & Mentorlar Kengashi */}
        <TeacherGrid
          onSelectTeacherForConsultation={(teacher) =>
            handleOpenLeadModal(`${teacher} bilan suhbat`)
          }
        />

        {/* 10. Ota-onalar Fikri & Samimiy Tavsiyalar */}
        <TestimonialsSection />

        {/* 11. 4 Bosqichli Shaffof Qabul Yo'l Xaritasi */}
        <AdmissionRoadmap onOpenLeadModal={handleOpenLeadModal} />

        {/* 12. Savol-Javoblar (FAQ) */}
        <FAQAccordion
          categoryFilter="umumiy"
          onOpenLeadModal={() => handleOpenLeadModal("Umumiy savol")}
        />

        {/* 13. Universal Ariza Topshirish Bloki */}
        <LeadBannerSection onOpenLeadModal={handleOpenLeadModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse={leadTarget}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
}
