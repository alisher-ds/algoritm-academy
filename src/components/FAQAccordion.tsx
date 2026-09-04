"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, } from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

interface FAQAccordionProps {
  categoryFilter?: "maktab" | "markaz" | "kurslar" | "qabul" | "umumiy" | "hammasi";
}

export default function FAQAccordion({ categoryFilter = "hammasi" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = ECOSYSTEM_DATA.faqs.filter((f) => {
    if (categoryFilter === "hammasi") return true;
    if (f.category === categoryFilter) return true;
    // "umumiy" savollar har bir bo'limda foydali — doim qo'shiladi
    if (f.category === "umumiy") return true;
    // "kurslar" so'rovi markaz (o'quv markazi) savollarini anglatadi
    if (categoryFilter === "kurslar" && f.category === "markaz") return true;
    // "qabul" so'rovi maktabga qabul savollari bilan birga umumiy savollarni ko'rsatadi
    if (categoryFilter === "qabul" && f.category === "maktab") return true;
    return false;
  });

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="savollar">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
 eyebrow="Savol-javoblar"
 eyebrowIcon={HelpCircle}
 title="Ko'p beriladigan savollar"
 className="mb-14"
 />

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-brand-500 bg-white shadow-md shadow-brand-500/5"
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
                      isOpen ? "rotate-180 bg-brand-100 text-brand-700" : "bg-white text-slate-400 border border-slate-200"
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
