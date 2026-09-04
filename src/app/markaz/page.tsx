"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import DtmGrantBanner from "@/components/DtmGrantBanner";
import CourseCatalog from "@/components/CourseCatalog";
import ReelsShowcase from "@/components/ReelsShowcase";
import TeacherGrid from "@/components/TeacherGrid";
import ResultsSection from "@/components/ResultsSection";
import FAQAccordion from "@/components/FAQAccordion";
import LeadBannerSection from "@/components/LeadBannerSection";
import LeadModal from "@/components/LeadModal";
import VideoModal from "@/components/VideoModal";
import DiagnosticQuizModal from "@/components/DiagnosticQuizModal";

export default function MarkazPage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadTarget, setLeadTarget] = useState("Prezident Maktabiga Tayyorlov (PMT)");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const handleOpenLeadModal = (courseName: string = "Prezident Maktabiga Tayyorlov (PMT)") => {
    setLeadTarget(courseName);
    setLeadModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. Header & Navbar */}
      <Navbar onOpenLeadModal={handleOpenLeadModal} />

      <main className="flex-1">
        {/* 2. Flagship Academy Hero with PMT, SAT, IELTS, DTM */}
        <Hero
          onOpenLeadModal={handleOpenLeadModal}
          onOpenVideoModal={() => setVideoModalOpen(true)}
          onOpenQuizModal={() => setQuizModalOpen(true)}
        />

        {/* 3. Stats Bar */}
        <StatsCounter />

        {/* 4. DTM & SAT Grant Results Banner */}
        <DtmGrantBanner />

        {/* 5. Modern Course Catalog with Search & Filters */}
        <CourseCatalog onOpenLeadModal={handleOpenLeadModal} />

        {/* 6. Live Reels & Direct Video Showcase */}
        <ReelsShowcase />

        {/* 7. Academy Mentors (IELTS ZONE style modal) */}
        <TeacherGrid
          onSelectTeacherForConsultation={(teacher) =>
            handleOpenLeadModal(`${teacher} bilan konsultatsiya`)
          }
        />

        {/* 8. Results & Certificates Wall */}
        <ResultsSection />

        {/* 9. FAQ Accordion */}
        <FAQAccordion
          categoryFilter="markaz"
          onOpenLeadModal={() => handleOpenLeadModal("O'quv markazi savoli")}
        />

        {/* 10. Lead Capture Banner */}
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

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <DiagnosticQuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        onSelectCourse={(course) => handleOpenLeadModal(course)}
      />
    </div>
  );
}
