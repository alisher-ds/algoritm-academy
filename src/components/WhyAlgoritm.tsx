import React from "react";
import { 
  Award, 
  Utensils, 
  BookOpen, 
  GraduationCap, 
  Cpu, 
  ShieldCheck, 
  Bus, 
  Clock, 
  Gift 
} from "lucide-react";

export default function WhyAlgoritm() {
  const advantages = [
    {
      icon: <Award className="w-6 h-6 text-brand" />,
      title: "10+ yillik tajriba",
      description: "Davlat litsenziyasiga ega, minglab o'quvchilarni yetishtirgan ishonchli ta'lim maskani.",
    },
    {
      icon: <Utensils className="w-6 h-6 text-brand" />,
      title: "3 mahal issiq ovqat",
      description: "Professional oshpazlar tomonidan tayyorlangan, sifatli parhez va to'yimli taomnoma.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-brand" />,
      title: "Uyga vazifasiz rejim",
      description: "Barcha mustaqil ishlar maktabning o'zida, malakali ustozlar nazoratida to'liq tugatiladi.",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-brand" />,
      title: "IELTS 7.5+ va OTM Grant",
      description: "Repetitorsiz maktabning o'zida mahalliy va xorijiy universitetlarga 100% tayyorgarlik.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-brand" />,
      title: "Zamonaviy IT & Robototexnika",
      description: "Dasturlash laboratoriyasi, 3D printerlar va robototexnika konstruktorlari.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand" />,
      title: "24/7 Smart xavfsizlik",
      description: "Qo'riqlanadigan hudud, kuzatuv kameralari va ota-onalarga kirish-chiqish SMS xabarnomasi.",
    },
    {
      icon: <Bus className="w-6 h-6 text-brand" />,
      title: "Xavfsiz qatnov (School Bus)",
      description: "Maxsus qatnov avtobuslari bolalarni uyingiz yaqinidan olib keladi va yetkazadi.",
    },
    {
      icon: <Clock className="w-6 h-6 text-brand" />,
      title: "To'liq kunlik ta'lim (08:30 - 17:00)",
      description: "Akademik darslar, to'garaklar, sport, ovqatlanish va dam olishning qat'iy balansi.",
    },
    {
      icon: <Gift className="w-6 h-6 text-brand" />,
      title: "Bepul birinchi sinov darsi",
      description: "O'quv markazimizdagi barcha kurslar uchun eng birinchi dars mutlaqo bepul.",
    },
  ];

  return (
    <section className="bg-[#0b1329] py-20 sm:py-28 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand block mb-2">
            Afzalliklarimiz
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
            Nega aynan Algoritm
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-7 hover:border-brand/40 hover:bg-white/[0.08] transition duration-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
