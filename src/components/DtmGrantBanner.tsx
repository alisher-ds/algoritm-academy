import React from "react";
import { TrendingUp, } from "lucide-react";

export default function DtmGrantBanner() {
  const highlights = [
    {
      score: "189.0",
      label: "Maksimal DTM Balli",
      subtext: "100% Davlat Granti Kafolati",
      category: "DTM Natijadorlik",
    },
    {
      score: "SAT 1450+",
      label: "Xalqaro Grant Natijasi",
      subtext: "AQSH va Xorijiy OTMlar",
      category: "Xalqaro SAT",
    },
    {
      score: "250+",
      label: "Milliy Sertifikat (A+)",
      subtext: "Matematika va Fanlar",
      category: "Fan Sertifikatlari",
    },
    {
      score: "Top 1",
      label: "PMT Qabul Ko'rsatkichi",
      subtext: "Prezident Maktablari",
      category: "Ixtisoslashtirilgan",
    },
  ];

  return (
    <section className="bg-night-deep py-16 text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-night via-night-deep to-night-deep p-8 sm:p-12 text-white border border-brand-500/20 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-white/10 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> Rasmiy Imtihon Natijalari
              </div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Muvaffaqiyatli Ta'lim Natijalari
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Akademiya o'quvchilari DTM, SAT, IELTS va Prezident maktabi imtihonlarida eng yuqori natijalarni qayd etishmoqda.
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0 bg-white/[0.03] border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
              <div>
                <span className="text-3xl font-black text-brand-500">98.5%</span>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">OTM Grantiga kirish</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div>
                <span className="text-3xl font-black text-white">100%</span>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Litsenziyalangan ta'lim</p>
              </div>
            </div>
          </div>

          {/* 4 Big Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-500/40 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                  {item.category}
                </span>
                <div className="text-3xl font-black text-white tracking-tight mb-1 group-hover:text-brand-500 transition-colors">
                  {item.score}
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  {item.label}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {item.subtext}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
