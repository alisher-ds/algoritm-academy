"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadModal from "@/components/LeadModal";
import { 
  MapPin, 
  Phone, 
  Send, 
  Clock, 
  School,
  GraduationCap,
  Award,
  Globe,
  } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

export default function AloqaPage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <Navbar onOpenLeadModal={() => setLeadModalOpen(true)} />

      <main className="flex-1">
        {/* Header */}
        <section className="relative pt-20 pb-16 bg-slate-950 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
              Markazimiz & Aloqa
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-4">
              Biz Bilan Bog'laning
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Algoritm Academy maktabi yoki o'quv markazimizga tashrif buyuring yoki to'g'ridan-to'g'ri qo'ng'iroq qiling.
            </p>
          </div>
        </section>

        {/* Campuses Grid */}
        <section className="py-16 sm:py-20 bg-white text-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* 1-Bino: Algoritm School */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-9 shadow-lg flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        1-Bino: Xususiy Maktab
                      </span>
                      <h3 className="text-2xl font-black text-slate-950 uppercase">
                        Algoritm School
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-8 font-medium">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Manzil:</strong> {ECOSYSTEM_DATA.school.address} ({ECOSYSTEM_DATA.school.landmark})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Telefon:</strong>{" "}
                        <a href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`} className="text-emerald-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.school.phone}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Telegram admin:</strong>{" "}
                        <a href={ECOSYSTEM_DATA.school.telegram} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">
                          @algoritm_xususiy_maktab
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Ish vaqti:</strong> {ECOSYSTEM_DATA.school.workingHours} (Dush - Shanba)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Yo'nalish:</strong> 1-11 sinflar, 3 mahal ovqat, to'garaklar, yotoqxona
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
                  <a
                    href={`tel:${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition"
                  >
                    Maktabga Qo'ng'iroq
                  </a>
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Maktab Qabuliga Yozilish
                  </button>
                </div>
              </div>

              {/* 2-Bino: Algoritm Academy (O'quv Markazi) */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-9 shadow-lg flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        2-Bino: O'quv Markazi
                      </span>
                      <h3 className="text-2xl font-black text-slate-950 uppercase">
                        Algoritm Academy
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-8 font-medium">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Manzil:</strong> {ECOSYSTEM_DATA.academy.address} ({ECOSYSTEM_DATA.academy.landmark})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Telefon:</strong>{" "}
                        <a href={`tel:${ECOSYSTEM_DATA.academy.phone.replace(/\D/g, "")}`} className="text-emerald-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.academy.phone}
                        </a>
                        <span className="text-slate-400 font-medium">/</span>{" "}
                        <a href={`tel:${(ECOSYSTEM_DATA.academy.phoneSecondary ?? "").replace(/\D/g, "")}`} className="text-emerald-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.academy.phoneSecondary}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Ish vaqti:</strong> {ECOSYSTEM_DATA.academy.workingHours} (Har kuni)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Yo'nalish:</strong> PMT, SAT 1500+, IELTS 7.5+, Milliy Sertifikat A+
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
                  <a
                    href={`tel:${ECOSYSTEM_DATA.academy.phone.replace(/\D/g, "")}`}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition"
                  >
                    Markazga Qo'ng'iroq
                  </a>
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Kursga Yozilish (1-Dars Bepul)
                  </button>
                </div>
              </div>

            </div>

            {/* Social & Contact Bar */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div>
                <h4 className="text-lg font-black uppercase text-white">
                  Ijtimoiy Tarmoqlarda Kuzatib Boring
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Telegram va Instagram sahifalarimizda har kuni yangi natijalar va muhim e'lonlar chiqib boradi.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={ECOSYSTEM_DATA.contact.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Telegram
                </a>
                <a
                  href={ECOSYSTEM_DATA.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" /> Instagram
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialCourse="Aloqa sahifasi arizasi"
      />
    </div>
  );
}
