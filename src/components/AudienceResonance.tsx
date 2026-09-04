import React from "react";
import { BookOpen, Target, Users, Sparkles, CheckCircle2 } from "lucide-react";

export default function AudienceResonance() {
  const points = [
    {
      title: "Repetitorsiz to'liq ta'lim izlayotgan bo'lsangiz",
      description: "Barcha mustaqil ishlar va uyga vazifalar maktabning o'zida, tajribali ustozlar nazoratida bajariladi.",
    },
    {
      title: "OTMga 100% grant yoki IELTS 7.5+ olmoqchi bo'lsangiz",
      description: "Mualliflik metodikasi va haftalik mock imtihonlar orqali yuqori natijaga kafolat beriladi.",
    },
    {
      title: "Xavfsiz va to'laqonli rivojlanish muhiti kerak bo'lsa",
      description: "3 mahal parhez taomlar, 24/7 smart kameralar, sport majmuasi va shaxsiy avtobus xizmati.",
    },
    {
      title: "Aniq fanlar va chet tillarini chuqur o'rganmoqchi bo'lsangiz",
      description: "Oliy toifali pedagoglar va Respublika olimpiadalari hakamlaridan bevosita bilim olasiz.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 text-[#0b1329]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark block mb-2">
            Kimlar uchun
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-navy">
            Algoritm siz uchun, agar...
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col justify-between hover:border-brand/40 hover:bg-white hover:shadow-lg transition duration-200"
            >
              <div>
                <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand-dark flex items-center justify-center font-bold text-sm mb-4">
                  0{idx + 1}
                </span>
                <h3 className="font-bold text-base text-navy leading-snug mb-2">
                  {pt.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
