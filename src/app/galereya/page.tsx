"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import VideoModal from "@/components/VideoModal";
import LeadModal from "@/components/LeadModal";
import { Camera } from "lucide-react";

export default function GalereyaPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1329] text-white">
      <Navbar onOpenLeadModal={() => setLeadModalOpen(true)} />

      <main className="flex-1">
        {/* Header */}
        <section className="relative pt-12 pb-16 bg-[#0b1329] border-b border-white/10 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/15 text-brand text-xs font-bold uppercase tracking-wider mb-6 border border-brand/30">
              <Camera className="w-3.5 h-3.5" /> Rasmiy Media Arxiv
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight mb-4">
              Algoritm Hayotidan Foto & Video Lavhalar
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Sinfxonalar, interaktiv dars mashg'ulotlari, ochiq eshiklar kuni va taqdirlash marosimlaridan eng sara fotolavhalar.
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <GalleryGrid onOpenVideoModal={() => setVideoModalOpen(true)} />
      </main>

      <Footer />

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse="Prezident Maktabiga Tayyorlov (PMT)"
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
}
