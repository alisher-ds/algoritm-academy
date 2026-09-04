"use client";

import React, { useState } from "react";
import { Camera, Play } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface GalleryGridProps {
  onOpenVideoModal?: () => void;
}

export default function GalleryGrid({ onOpenVideoModal }: GalleryGridProps) {
  const [activeFilter, setActiveFilter] = useState("hammasi");

  const categories = [
    { id: "hammasi", label: "Barcha Lavhalar" },
    { id: "darslar", label: "Dars Jarayoni" },
    { id: "mashgulotlar", label: "PMT & SAT Darslari" },
  ];

  const filteredPhotos = ECOSYSTEM_DATA.gallery.filter(
    (g) => activeFilter === "hammasi" || g.category === activeFilter
  );

  return (
    <section className="bg-white py-20 sm:py-28 text-[#0b1329]" id="galereya">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark block mb-2">
            Jonli Muhit (Demo)
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-navy">
            O'quv markazimiz hayotidan lavhalar
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Algoritm Academy zamonaviy o'quv xonalari, interaktiv darslar va o'quvchilarimiz mashg'ulotlaridan lavhalar.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeFilter === cat.id
                  ? "bg-brand text-slate-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:text-navy border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-100 shadow-sm h-72 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={onOpenVideoModal}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand text-slate-950 text-[10px] font-extrabold uppercase tracking-wider mb-2 inline-block shadow-sm">
                    {item.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-brand group-hover:text-slate-950 transition">
                  <Play className="w-4 h-4 fill-white group-hover:fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
