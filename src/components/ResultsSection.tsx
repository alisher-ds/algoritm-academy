"use client";

import React, { useState, useMemo } from "react";
import { 
  Award, 
  CheckCircle2, 
  Search, 
  } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

export default function ResultsSection() {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "Barchasi" },
    { id: "SAT", label: "Digital SAT (1200+)" },
    { id: "189 Ball", label: "189.0 Maksimal Ball" },
    { id: "OTM Granti", label: "100% Davlat Grantlari" },
    { id: "Prezident Maktabi", label: "Prezident & Al-Xorazmiy" },
    { id: "Sertifikat", label: "Milliy Sertifikatlar" },
    { id: "Olimpiada", label: "Respublika Olimpiadalari" },
  ];

  const filteredResults = useMemo(() => {
    return ECOSYSTEM_DATA.achievements.filter((item) => {
      const matchesFilter = filter === "all" || item.category === filter;
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.score.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.universityOrCert && item.universityOrCert.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  return (
    <section className="bg-slate-50 py-20 sm:py-28 text-slate-900 border-b border-slate-200" id="natijalar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeader wide eyebrow="Tasdiqlangan natijalar bazasi" eyebrowIcon={Award} title="Akademik natijadorlik bazasi" description="Respublika fan olimpiadalari, xalqaro Digital SAT imtihonlari, 189 maksimal ball hamda davlat grantlari bo'yicha to'liq va shaffof hisobot." className="mb-12" />

        {/* Qidiruv & Kategoriya Tanlovi */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm mb-10">
          
          {/* Qidiruv Maydoni */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ko'rsatkich, soha yoki ball bo'yicha qidirish (masalan: SAT 1520, Davlat Granti, 189, Al-Xorazmiy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
          </div>

          {/* Kategoriya Tugmalari */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  filter === cat.id
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Natijalar Matritsasi (Mediasiz, Aniq Analitik Kartochkalar) */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Qidiruvingiz bo'yicha hech qanday natija topilmadi. Qidiruv so'zini o'zgartirib ko'ring.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 text-[10px] font-black uppercase tracking-wider border border-brand-200">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {item.year}
                    </span>
                  </div>

                  <div className="text-xl font-black text-slate-950 mb-1">
                    {item.score}
                  </div>
                  <h4 className="text-sm font-extrabold text-brand-700 mb-2">
                    {item.studentName}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.detail}
                  </p>
                </div>

                {item.universityOrCert && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{item.universityOrCert}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
