"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface FAQAccordionProps {
  categoryFilter?: "maktab" | "markaz" | "kurslar" | "qabul" | "umumiy" | "hammasi";
  onOpenLeadModal?: () => void;
}

export default function FAQAccordion({ categoryFilter = "hammasi", onOpenLeadModal }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = ECOSYSTEM_DATA.faqs.filter((f) => {
    if (categoryFilter === "hammasi") return true;
    if (f.category === categoryFilter) return true;
    if (f.category === ("umumiy" as any)) return true;
    if (categoryFilter === "kurslar" && f.category === "markaz") return true;
    return false;
  });

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="savollar">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> Savol-Javoblar
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase">
            Ko'p Beriladigan Savollar
          </h2>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-emerald-500 bg-white shadow-md shadow-emerald-500/5"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full py-5 px-6 sm:px-8 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-950">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-emerald-100 text-emerald-700" : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
