import React from "react";
import Link from "next/link";
import { 
  School, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
} from "lucide-react";

interface EcosystemSplitProps {
  onOpenLeadModal: (type: "maktab" | "kurs") => void;
}

export default function EcosystemSplit({ onOpenLeadModal }: EcosystemSplitProps) {
  return (
    <section className="py-20 bg-[#0b1329] relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/15 text-brand text-xs font-bold uppercase tracking-wider mb-3 border border-brand/30">
            <Sparkles className="w-3.5 h-3.5" /> Bitta Ekosistema — Ikki Katta Yo'nalish
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            Sizga Qaysi Ta'lim Dasturi Mos?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Algoritm ekotizimida xususiy maktab o'quvchilari ham, o'quv markazimizning kursantlari ham eng yuqori sifatli ta'lim muhitidan bahramand bo'lishadi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Xususiy Maktab */}
          <div className="relative group rounded-3xl bg-white/5 p-8 sm:p-10 border border-white/10 hover:border-brand/40 shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition duration-500 pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                  <School className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
                  1-11 Sinflar & Yotoqxona
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Algoritm Xususiy Maktabi
              </h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                Farzandingizning 1-sinfdan to 11-sinfgacha bo'lgan to'liq akademik va shaxsiy rivojlanishi uchun xavfsiz, zamonaviy va keng imkoniyatli maktab.
              </p>

              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">To'liq kunlik ta'lim:</strong> 08:30 dan 17:00 gacha
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">3 mahal issiq ovqat</strong> va sifatli parhez taomlar
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">O'zbek va Rus tillaridagi</strong> sinflar
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">Shinam Yotoqxona</strong> va xavfsiz transport
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onOpenLeadModal("maktab")}
                className="w-full sm:w-auto flex-1 py-3.5 px-5 rounded-full bg-brand hover:bg-brand-light text-slate-950 text-sm font-bold shadow-sm transition-all text-center"
              >
                Qabulga Ariza Topshirish
              </button>
              <Link
                href="/maktab"
                className="w-full sm:w-auto py-3.5 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 transition flex items-center justify-center gap-2"
              >
                Maktab Haqida Batafsil <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
            </div>
          </div>

          {/* Card 2: O'quv Markazi */}
          <div className="relative group rounded-3xl bg-white/5 p-8 sm:p-10 border border-white/10 hover:border-brand/40 shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition duration-500 pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                  <BookOpen className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
                  PMT, SAT & DTM
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Algoritm O'quv Markazi
              </h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                Prezident maktabiga (PMT) tayyorgarlik, SAT 1400+, IELTS 7.5+ va DTM 100% grant kafolatli repetitorlik kurslari.
              </p>

              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">Prezident Maktabi (PMT):</strong> Maxsus repetitsion tizim
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">SAT & IELTS:</strong> Xalqaro grant dasturlari
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">350+ Milliy Sertifikat</strong> olgan o'quvchilar
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    <strong className="text-white">1-Dars mutlaqo bepul</strong> sinov darsi
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onOpenLeadModal("kurs")}
                className="w-full sm:w-auto flex-1 py-3.5 px-5 rounded-full bg-brand hover:bg-brand-light text-slate-950 text-sm font-bold shadow-sm transition-all text-center"
              >
                Kurslarga Yozilish
              </button>
              <Link
                href="/kurslar"
                className="w-full sm:w-auto py-3.5 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 transition flex items-center justify-center gap-2"
              >
                Barcha Kurslar <ArrowRight className="w-4 h-4 text-brand" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
