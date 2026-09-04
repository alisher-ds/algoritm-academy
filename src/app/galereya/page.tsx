"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import LeadModal from "@/components/LeadModal";
import { Camera } from "lucide-react";

export default function GalereyaPage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar onOpenLeadModal={() => setLeadModalOpen(true)} />

      <main className="flex-1">
        {/* Header */}
        <section className="relative pt-12 pb-16 bg-slate-950 text-white border-b border-white/10 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/20">
              <Camera className="w-3.5 h-3.5" /> Algoritm Media Arxiv
            </span>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Algoritm hayotidan foto lavhalar
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Sinfxonalar, interaktiv dars mashg'ulotlari, ochiq eshiklar kuni va tadbirlardan lavhalar.
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <GalleryGrid />
      </main>

      <Footer />

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse="Prezident Maktabiga Tayyorlov (PMT)"
      />
    </div>
  );
}
