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
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          
          {/* 1. OTM Talabalari va Grantlar */}
          <ScrollReveal variant="fade-up" delay={0} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-slate-950 text-white flex flex-col justify-between shadow-lg relative overflow-hidden w-full">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
                <GraduationCap className="w-32 h-32 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-400 text-[10px] font-black uppercase tracking-wider border border-brand-500/30">
                    Oliy Ta'lim
                  </span>
                  <span className="text-[11px] font-bold text-brand-400">100% Byudjet</span>
                </div>
                <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white">
                  <AnimatedCounter target={600} suffix="+" />
                </div>
                <div className="mt-1 text-base font-bold text-slate-200">
                  OTM Talabalari
                </div>
              </div>
              <div className="mt-6 text-xs text-slate-300 border-t border-white/10 pt-3.5 flex items-center justify-between">
                <span className="font-semibold">Davlat Grantlari Sohiblari:</span>
                <span className="text-brand-400 font-black text-sm">
                  <AnimatedCounter target={150} suffix="+ Grant" />
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* 2. SAT 1200+ va 1500+ */}
          <ScrollReveal variant="fade-up" delay={100} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-brand-800 text-white flex flex-col justify-between shadow-lg relative overflow-hidden w-full">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
                <Globe2 className="w-32 h-32 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    Digital SAT
                  </span>
                  <span className="text-[11px] font-bold text-brand-200">Top 1% Global</span>
                </div>
                <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white">
                  <AnimatedCounter target={100} suffix="+ Ta" />
                </div>
                <div className="mt-1 text-base font-bold text-white">
                  SAT 1200+ Natija
                </div>
              </div>
              <div className="mt-6 text-xs text-brand-100 border-t border-white/15 pt-3.5 flex items-center justify-between">
                <span className="font-semibold">SAT 1500+ Global Elita:</span>
                <span className="font-black text-white text-sm">5 Nafar (1520 Eng Yuqori)</span>
              </div>
            </div>
          </ScrollReveal>

          {/* 3. Prezident va Ixtisoslashtirilgan Maktablar */}
          <ScrollReveal variant="fade-up" delay={200} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition duration-200 w-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-brand-100 text-brand-800 text-[10px] font-black uppercase tracking-wider">
                    Ixtisoslashgan Ta'lim
                  </span>
                  <span className="text-[11px] font-bold text-brand-700">PMT & Al-Xorazmiy</span>
                </div>
                <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                  <AnimatedCounter target={300} suffix="+" />
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
          </ScrollReveal>

          {/* 4. Jami Fan Sertifikatlari */}
          <ScrollReveal variant="fade-up" delay={100} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition duration-200 w-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                    Milliy Sertifikatlar
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">A va A+ Darajalar</span>
                </div>
                <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                  <AnimatedCounter target={700} suffix="+ Ta" />
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
          </ScrollReveal>

          {/* 5. Chet Tili Sertifikatlari (B2 va Undan Yuqori) */}
          <ScrollReveal variant="fade-up" delay={200} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition duration-200 w-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider">
                    Xalqaro Tillar
                  </span>
                  <span className="text-[11px] font-bold text-purple-700">IELTS & Multilevel</span>
                </div>
                <div className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                  <AnimatedCounter target={50} suffix="+ Ta" />
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
          </ScrollReveal>

          {/* 6. Respublika Fan Olimpiadasi Bosh Mukofoti */}
          <ScrollReveal variant="fade-up" delay={300} duration={700} className="h-full flex">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition duration-200 w-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                    Respublika Chempioni
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">Mutlaq 1-O'rin</span>
                </div>
                <div className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  <AnimatedCounter target={60} suffix=" Mln UZS" />
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
          </ScrollReveal>

        </div>

        {/* 3. Rasmiy Tasdiqlanganlik va Shaffoflik Eslatmasi */}
        <ScrollReveal variant="fade-up" delay={150} duration={700}>
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5 font-medium">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Ko'rsatkichlar Algoritm Academy xususiy maktabi va o'quv markazi bitiruvchilarining rasmiy buyruqlari, davlat grantlari va xalqaro sertifikatlari asosida shakllantirilgan.</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-800 font-bold shrink-0 bg-brand-100/70 px-3 py-1.5 rounded-xl border border-brand-200">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Rasmiy Tasdiqlangan Natijalar</span>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
