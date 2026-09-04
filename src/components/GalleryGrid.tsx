"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

const CATEGORY_LABELS: Record<string, string> = {
  darslar: "Dars jarayoni",
  tadbirlar: "Tadbirlar",
  sharoitlar: "Sharoitlar",
};

export default function GalleryGrid() {
  const [activeFilter, setActiveFilter] = useState("hammasi");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: "hammasi", label: "Barcha lavhalar" },
    { id: "darslar", label: "Dars jarayoni" },
    { id: "tadbirlar", label: "Tadbirlar" },
    { id: "sharoitlar", label: "Sharoitlar" },
  ];

  const filteredPhotos = ECOSYSTEM_DATA.gallery.filter(
    (g) => activeFilter === "hammasi" || g.category === activeFilter
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((cur) =>
        cur === null ? null : (cur + dir + filteredPhotos.length) % filteredPhotos.length
      );
    },
    [filteredPhotos.length]
  );

  // Klaviatura va body-scroll boshqaruvi
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, step]);

  const selected = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className="bg-slate-50 py-20 text-slate-900 sm:py-24" id="galereya">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Haqiqiy foto lavhalar"
          eyebrowIcon={Camera}
          title="Algoritm hayotidan lavhalar"
          description="Xususiy maktab va akademiyamizning dars jarayonlari, zamonaviy xonalari va tadbir lavhalari."
          className="mb-12"
        />

        {/* Kategoriyalar */}
        <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-4" role="tablist" aria-label="Galereya kategoriyalari">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeFilter === cat.id}
              onClick={() => {
                setActiveFilter(cat.id);
                setLightboxIndex(null);
              }}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeFilter === cat.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(i)}
              className="group relative block h-72 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-brand-500"
              aria-label={`${item.title} — kattalashtirib ko'rish`}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

              {/* Hover'da kattalashtirish belgisi */}
              <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>

              <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                <span className="mb-2 inline-block rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <h4 className="text-sm font-bold leading-snug text-white sm:text-base">
                  {item.title}
                </h4>
              </figcaption>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Yuqori panel */}
            <div className="mb-3 flex items-center justify-between text-white">
              <span className="text-xs font-medium text-slate-400">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                onClick={closeLightbox}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Rasm */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <img
                src={selected.image}
                alt={selected.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            {/* Izoh */}
            <div className="mt-3 flex items-start justify-between gap-4 text-white">
              <div>
                <h3 className="font-display text-lg font-bold">{selected.title}</h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  {CATEGORY_LABELS[selected.category] ?? selected.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => step(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                  aria-label="Oldingi rasm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => step(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                  aria-label="Keyingi rasm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
