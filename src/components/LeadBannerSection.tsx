"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

interface LeadBannerSectionProps {
  onOpenLeadModal?: (targetName?: string) => void;
}

export default function LeadBannerSection({ onOpenLeadModal }: LeadBannerSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [direction, setDirection] = useState("1-11 Sinf Xususiy Maktabi");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setPhone("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="bg-slate-50 py-20 sm:py-28 text-slate-900 border-b border-slate-200/80" id="ariza">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column: Heading & Value */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-white/15">
                <ShieldCheck className="w-4 h-4 text-[#00E676]" /> Bepul Diagnostika & Suhbat
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Qabul 2026 Uchun <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00E676]">
                  Arizangizni Qoldiring
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-medium">
                Xususiy maktab yoki o'quv markazi kurslariga qiziqishingiz bo'yicha bepul sinov darsi va professional metodist konsultatsiyasini oling.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>1-dars mutlaqo bepul</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  <span>15 daqiqada mutaxassis aloqasi</span>
                </div>
              </div>
            </div>

            {/* Right Column: Lead Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-7 sm:p-9 text-slate-900 shadow-2xl">
                {submitted ? (
                  <div className="py-12 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950 uppercase">Arizangiz Qabul Qilindi!</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                      Tez orada Algoritm Academy mutaxassisi siz bilan bog'lanadi va bepul dars vaqtini kelishadi.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Ismingiz yoki Farzandingiz ismi
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masalan: Sardorbek Alimov"
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Telefon raqamingiz
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 (90) 123-45-67"
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Qaysi yo'nalishga yozilmoqchisiz?
                      </label>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition shadow-xs"
                      >
                        <option value="1-11 Sinf Xususiy Maktabi">🏫 1-11 Sinf Xususiy Maktabi (To'liq kun)</option>
                        <option value="Prezident Maktabiga Tayyorlov (PMT)">🎯 Prezident Maktabiga Tayyorlov (PMT 3-4 sinf)</option>
                        <option value="Digital SAT & 100% Xalqaro Grantlar">🌐 Digital SAT (1200+, 1500+ Elita)</option>
                        <option value="IELTS 7.5+ & CEFR Intensive">🇬🇧 IELTS 7.5+ & CEFR Intensive</option>
                        <option value="Matematika Milliy Sertifikat (A+) & DTM">📐 Matematika Milliy Sertifikat (A+) & DTM</option>
                        <option value="Tarix va Ona tili Milliy Sertifikat">📚 Tarix va Ona tili Milliy Sertifikatlari</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-[#00C853] hover:bg-[#00E676] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Arizani Topshirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
