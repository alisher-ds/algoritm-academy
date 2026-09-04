"use client";

import React from "react";
import { MessageSquare, Star, Quote, CheckCircle2, ShieldCheck } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rustam Qodirov",
      role: "5-sinf o'quvchisi otasi",
      badge: "Tasdiqlangan Ota-ona",
      highlight: "Uy vazifalari maktabning o'zida",
      quote: "O'g'limizning matematika va ingliz tiliga bo'lgan qiziqishi butunlay o'zgardi. Eng muhimi, barcha uyga vazifalar maktabning o'zida o'qituvchi nazoratida bajariladi, uyda farzandimiz bilan bemalol dam olamiz.",
      rating: 5,
    },
    {
      name: "Dilnoza Karimova",
      role: "3-sinf o'quvchisi onasi",
      badge: "Tasdiqlangan Ota-ona",
      highlight: "3 mahal ovqat & transport",
      quote: "Maktabdagi 3 mahal toza issiq ovqat va xavfsiz avtobus xizmati biz uchun katta yordam bo'ldi. O'qituvchilar har bir bolaning fe'l-atvoriga qarab individual yondashishadi va doimiy aloqada bo'lishadi.",
      rating: 5,
    },
    {
      name: "Akmal Saidov",
      role: "9-sinf o'quvchisi otasi",
      badge: "Tasdiqlangan Ota-ona",
      highlight: "SAT & PMT Yuqori Natijasi",
      quote: "Farzandimiz Prezident maktabiga tayyorgarlik va SAT kurslarida qatnashib, a'lo natijalar ko'rsatmoqda. Algoritm jamoasining intizomi, metodikasi va o'quvchiga bo'lgan talabchanligi juda yuqori darajada.",
      rating: 5,
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 text-slate-900 border-b border-slate-200/80" id="tavsiyalar">
      <div id="fikrlar"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Ishonch & Fikrlar
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Ota-onalar Nima Deydi?
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Farzandini bizga ishongan ota-onalarning samimiy tavsiyalari va baholari.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-7 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-emerald-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left relative group"
            >
              <div>
                {/* Header row: stars & badge */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.badge}
                  </span>
                </div>

                {/* Highlight pill */}
                <div className="inline-block text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-xl mb-3 shadow-xs">
                  {item.highlight}
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.role}
                  </p>
                </div>
                <Quote className="w-6 h-6 text-emerald-200 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Banner */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Har bir ota-ona istalgan vaqtda maktabga kelib ta'lim muhiti va dars jarayoni bilan shaxsan tanishishi mumkin.</span>
          </div>
          <span className="text-emerald-800 font-bold shrink-0">
            100% Ochiq va Shaffof Ta'lim
          </span>
        </div>

      </div>
    </section>
  );
}
