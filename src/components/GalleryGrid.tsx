"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

const CATEGORY_LABELS: Record<string, string> = {
  darslar: "Dars Jarayoni",
  tadbirlar: "Tadbirlar",
  sharoitlar: "Sharoitlar",
};

export default function GalleryGrid() {
  const [activeFilter, setActiveFilter] = useState("hammasi");

  const categories = [
    { id: "hammasi", label: "Barcha Lavhalar" },
    { id: "darslar", label: "Dars Jarayoni" },
    { id: "tadbirlar", label: "Tadbirlar" },
    { id: "sharoitlar", label: "Sharoitlar" },
  ];

  const filteredPhotos = ECOSYSTEM_DATA.gallery.filter(
    (g) => activeFilter === "hammasi" || g.category === activeFilter
  );

  return (
    <section className="bg-slate-50 py-20 sm:py-28 text-slate-900" id="galereya">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Haqiqiy foto lavhalar" eyebrowIcon={Camera} title="Algoritm hayotidan lavhalar" description="Xususiy maktab va akademiyamizning dars jarayonlari, zamonaviy xonalari va tadbir lavhalari." className="mb-12" />

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeFilter === cat.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((item) => (
            <figure
              key={item.id}
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm h-72 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <figcaption className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 inline-block shadow-sm">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h4>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
