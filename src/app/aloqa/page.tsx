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
import InteractiveMapSection from "@/components/InteractiveMapSection";

export default function AloqaPage() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <Navbar onOpenLeadModal={() => setLeadModalOpen(true)} />

      <main className="flex-1">
        {/* Header */}
        <section className="relative pt-20 pb-16 bg-slate-950 border-b border-white/10">
          {/* Ilgari bitta className'da `max-w-7xl` va `max-w-3xl` birga yozilgan edi —
              CSS tartibida 7xl yutib, mo'ljallangan tor ustun ishlamasdi. */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
              Markazimiz & Aloqa
            </span>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
              Biz bilan bog&apos;laning
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Algoritm Academy maktabi yoki o'quv markazimizga tashrif buyuring yoki to'g'ridan-to'g'ri qo'ng'iroq qiling.
            </p>
            </div>
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
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center font-black">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-brand-800 uppercase tracking-wider block">
                        1-Bino: Xususiy Maktab
                      </span>
                      <h3 className="font-display text-2xl font-extrabold text-slate-950">
                        Algoritm School
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-8 font-medium">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Manzil:</strong>{" "}
                        <a
                          href="https://maps.app.goo.gl/Rkv1RmfmowBawY5x5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-700 font-bold hover:underline"
                          title="Google Maps'da ochish"
                        >
                          {ECOSYSTEM_DATA.school.address}
                        </a>{" "}
                        ({ECOSYSTEM_DATA.school.landmark})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Telefon:</strong>{" "}
                        <a href={`tel:+${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`} className="text-brand-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.school.phone}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Telegram admin:</strong>{" "}
                        <a href={ECOSYSTEM_DATA.school.telegram} target="_blank" rel="noreferrer" className="text-brand-700 font-bold hover:underline">
                          @algoritm_xususiy_maktab
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Ish vaqti:</strong> {ECOSYSTEM_DATA.school.workingHours} (Dush - Shanba)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Yo'nalish:</strong> 0–11 sinflar, 3 mahal ovqat, to'garaklar, yotoqxona
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-2.5 items-center justify-between">
                  <a
                    href={`tel:+${ECOSYSTEM_DATA.school.phone.replace(/\D/g, "")}`}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider transition"
                  >
                    Maktabga Qo'ng'iroq
                  </a>
                  <a
                    href="https://maps.app.goo.gl/Rkv1RmfmowBawY5x5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-800 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Maps</span>
                  </a>
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Qabulga Yozilish
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
                      <h3 className="font-display text-2xl font-extrabold text-slate-950">
                        Algoritm Academy
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-8 font-medium">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Manzil:</strong>{" "}
                        <a
                          href="https://maps.app.goo.gl/2Grpzgi6X6SeiruA6"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-700 font-bold hover:underline"
                          title="Google Maps'da ochish"
                        >
                          {ECOSYSTEM_DATA.academy.address}
                        </a>{" "}
                        ({ECOSYSTEM_DATA.academy.landmark})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Telefon:</strong>{" "}
                        <a href={`tel:+${ECOSYSTEM_DATA.academy.phone.replace(/\D/g, "")}`} className="text-brand-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.academy.phone}
                        </a>
                        <span className="text-slate-400 font-medium">/</span>{" "}
                        <a href={`tel:+${(ECOSYSTEM_DATA.academy.phoneSecondary ?? "").replace(/\D/g, "")}`} className="text-brand-700 font-bold hover:underline font-mono">
                          {ECOSYSTEM_DATA.academy.phoneSecondary}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Ish vaqti:</strong> {ECOSYSTEM_DATA.academy.workingHours} (Har kuni)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>
                        <strong>Yo'nalish:</strong> PMT, SAT 1500+, IELTS 7+, Milliy Sertifikat A+
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-2.5 items-center justify-between">
                  <a
                    href={`tel:+${ECOSYSTEM_DATA.academy.phone.replace(/\D/g, "")}`}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider transition"
                  >
                    Markazga Qo'ng'iroq
                  </a>
                  <a
                    href="https://maps.app.goo.gl/2Grpzgi6X6SeiruA6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-800 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Maps</span>
                  </a>
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    1-Dars Bepul
                  </button>
                </div>
              </div>

            </div>

            {/* Social & Contact Bar */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div>
                <h4 className="font-display text-lg font-extrabold text-white">
                  Ijtimoiy tarmoqlarda kuzatib boring
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
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Telegram
                </a>
                <a
                  href={ECOSYSTEM_DATA.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" /> Instagram
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Real Interactive Map Section */}
        <InteractiveMapSection />
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
