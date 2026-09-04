"use client";

import React from "react";
import { 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  ShieldCheck,
  Globe2
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

export default function SchoolResults() {
  return (
    <section className="bg-white py-20 sm:py-28 text-slate-900 border-b border-slate-200" id="natijalar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Sarlavha */}
        <SectionHeader
 eyebrow="Rasmiy statistika"
 eyebrowIcon={Award}
 title="Akademik natijalar va ta'lim sifati"
 description="Algoritm Academy ta'lim ekotizimi (xususiy maktab va akademik o'quv markazi) bo'yicha davlat grantlari, SAT, Prezident maktablari va fan sertifikatlarining rasmiy tasdiqlangan jamlangan natijalari."
 wide
 className="mb-12"
 />

        {/* 2. Asosiy Ko'rsatkichlar Paneli (6 ta Asosiy Blok) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          
          {/* 1. OTM Talabalari va Grantlar */}
          <div className="p-7 rounded-3xl bg-slate-950 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
              <GraduationCap className="w-32 h-32 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Oliy Ta'lim
                </span>
                <span className="text-[11px] font-bold text-emerald-400">100% Byudjet</span>
              </div>
              <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white">
                600+
              </div>
              <div className="mt-1 text-base font-bold text-slate-200">
                OTM Talabalari
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-300 border-t border-white/10 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">Davlat Grantlari Sohiblari:</span>
              <span className="text-emerald-400 font-black text-sm">150+ Grant</span>
            </div>
          </div>

          {/* 2. SAT 1200+ va 1500+ */}
          <div className="p-7 rounded-3xl bg-emerald-800 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
              <Globe2 className="w-32 h-32 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  Digital SAT
                </span>
                <span className="text-[11px] font-bold text-emerald-200">Top 1% Global</span>
              </div>
              <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white">
                100+ Ta
              </div>
              <div className="mt-1 text-base font-bold text-white">
                SAT 1200+ Natija
              </div>
            </div>
            <div className="mt-6 text-xs text-emerald-100 border-t border-white/15 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">SAT 1500+ Global Elita:</span>
              <span className="font-black text-white text-sm">5 Nafar (1520 Eng Yuqori)</span>
            </div>
          </div>

          {/* 3. Prezident va Ixtisoslashtirilgan Maktablar */}
          <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Ixtisoslashgan Ta'lim
                </span>
                <span className="text-[11px] font-bold text-emerald-700">PMT & Al-Xorazmiy</span>
              </div>
              <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                300+
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                Prezident va Ixtisoslashtirilgan Maktab O'quvchilari
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-600 border-t border-slate-200 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">Al-Xorazmiy, Muhandislik, 1-son:</span>
              <span className="font-black text-slate-950 text-sm">Davlat Granti</span>
            </div>
          </div>

          {/* 4. Jami Fan Sertifikatlari */}
          <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                  Milliy Sertifikatlar
                </span>
                <span className="text-[11px] font-bold text-blue-700">A va A+ Darajalar</span>
              </div>
              <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                700+ Ta
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                Jami Fan Sertifikatlari
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-600 border-t border-slate-200 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">Tarix, Ona tili, Matematika:</span>
              <span className="font-black text-slate-950 text-sm">Muddatidan Oldin Talabalik</span>
            </div>
          </div>

          {/* 5. Chet Tili Sertifikatlari (B2 va Undan Yuqori) */}
          <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider">
                  Xalqaro Tillar
                </span>
                <span className="text-[11px] font-bold text-purple-700">IELTS & Multilevel</span>
              </div>
              <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                50+ Ta
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                Chet Tili Sertifikatlari (B2 va Undan Yuqori)
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-600 border-t border-slate-200 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">IELTS 8.0, 7.0, 6.5 & CEFR B2:</span>
              <span className="font-black text-slate-950 text-sm">100% Imtiyoz</span>
            </div>
          </div>

          {/* 6. Respublika Fan Olimpiadasi Bosh Mukofoti */}
          <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  Respublika Chempioni
                </span>
                <span className="text-[11px] font-bold text-amber-700">Mutlaq 1-O'rin</span>
              </div>
              <div className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                60 Mln UZS
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                KYO Respublika Olimpiadasi Bosh Mukofoti
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-600 border-t border-slate-200 pt-3.5 flex items-center justify-between">
              <span className="font-semibold">150 Saralangan Iqtidor orasida:</span>
              <span className="font-black text-amber-800 text-sm">94 Ball (Bosh Sovrin)</span>
            </div>
          </div>

        </div>

        {/* 3. Rasmiy Tasdiqlanganlik va Shaffoflik Eslatmasi */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Ko'rsatkichlar Algoritm Academy xususiy maktabi va o'quv markazi bitiruvchilarining rasmiy buyruqlari, davlat grantlari va xalqaro sertifikatlari asosida shakllantirilgan.</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold shrink-0 bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Tasdiqlangan Natijadorlik</span>
          </div>
        </div>

      </div>
    </section>
  );
}
