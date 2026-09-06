"use client";

import React from "react";
import { 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  ShieldCheck,
  Globe2,
  Building2,
  Sparkles
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import Marquee from "@/components/Marquee";

const UNIVERSITIES = [
  {
    name: "Westminster International University (WIUT)",
    badge: "100% Davlat Granti",
    city: "Toshkent / London",
    icon: "🏛️",
  },
  {
    name: "Inha University in Tashkent (IUT)",
    badge: "CS & Software Grant",
    city: "Janubiy Koreya dasturi",
    icon: "💻",
  },
  {
    name: "Cambridge Assessment International",
    badge: "Xalqaro Akkreditatsiya",
    city: "Buyuk Britaniya",
    icon: "🇬🇧",
  },
  {
    name: "Webster University",
    badge: "AQSH Ta'lim Dasturi",
    city: "St. Louis, AQSH",
    icon: "🇺🇸",
  },
  {
    name: "Central Asian University (CAU)",
    badge: "Tibbiyot & Muhandislik",
    city: "Xalqaro Standart",
    icon: "🔬",
  },
  {
    name: "Turin Polytechnic University (TTPU)",
    badge: "Muhandislik & Avto",
    city: "Italiya dasturi",
    icon: "⚙️",
  },
  {
    name: "O'zbekiston Milliy Universiteti (O'zMU)",
    badge: "Davlat Byudjeti",
    city: "Aniq va Gumanitar Fanlar",
    icon: "📐",
  },
  {
    name: "Toshkent Davlat Yuridik Universiteti (TDYU)",
    badge: "189 Ball Maksimal",
    city: "Huquqshunoslik",
    icon: "⚖️",
  },
  {
    name: "Toshkent Tibbiyot Akademiyasi (TMA)",
    badge: "Davlat Granti",
    city: "Davolash & Pediatriya",
    icon: "🩺",
  },
  {
    name: "Amity University Tashkent",
    badge: "Global IT & Menejment",
    city: "Hindiston / Toshkent",
    icon: "🌐",
  },
  {
    name: "TATU Axborot Texnologiyalari",
    badge: "IT & Kiberxavfsizlik",
    city: "Davlat Granti",
    icon: "🛡️",
  },
];

const STUDENT_ACHIEVEMENTS = [
  {
    name: "Rustamov Diyorbek",
    score: "SAT 1520",
    detail: "Top 1% Global Elita",
    badge: "AQSH Oliygohiga $120,000 Grant",
    avatar: "🎓",
  },
  {
    name: "Karimova Madina",
    score: "IELTS 8.0",
    detail: "Reading 9.0 • Listening 8.5",
    badge: "WIUT 100% Davlat Granti",
    avatar: "⭐",
  },
  {
    name: "Qodirov Behruz",
    score: "PMT 100%",
    detail: "Prezident Maktabi 1-O'rin",
    badge: "To'liq Bepul Davlat Ta'limi",
    avatar: "🏛️",
  },
  {
    name: "Normatov Javohir",
    score: "Mutlaq Chempion",
    detail: "Respublika Fan Olimpiadasi",
    badge: "60 Mln UZS Bosh Mukofot",
    avatar: "🥇",
  },
  {
    name: "Xolmurodova Sabina",
    score: "189.0 Ball",
    detail: "OTM Imtihonida Maksimal Natija",
    badge: "TDYU Huquqshunoslik Granti",
    avatar: "⚖️",
  },
  {
    name: "Toshpo'latov Asadbek",
    score: "IELTS 7.5",
    detail: "15 Yoshda Ilg'or Natija",
    badge: "CEFR C1 Rasmiy Sertifikat",
    avatar: "🇬🇧",
  },
  {
    name: "Abdullayev Sardor",
    score: "Inha CS 100%",
    detail: "Dasturiy Ta'minot Yo'nalishi",
    badge: "Koreya Jamg'armasi Granti",
    avatar: "💻",
  },
  {
    name: "Ergashev Temur",
    score: "Matematika A+",
    detail: "Milliy Sertifikat 100 Ball",
    badge: "OTMga Imtihonsiz Qabul",
    avatar: "📐",
  },
  {
    name: "Shodiyev Azizbek",
    score: "Al-Xorazmiy",
    detail: "Ixtisoslashtirilgan Maktab",
    badge: "Olimpiadachilar Sinfiga Qabul",
    avatar: "🏆",
  },
  {
    name: "Bozorov Sherzod",
    score: "SAT 1490",
    detail: "Math 800 (Maksimal)",
    badge: "Xalqaro Universitet Granti",
    avatar: "🚀",
  },
];

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

        {/* 3. Cheksiz Marquee: Universitetlar va O'quvchilar Zafar Lentasi */}
        <ScrollReveal variant="fade-up" delay={100} duration={750} className="mb-10">
          <div className="rounded-3xl bg-slate-50/80 border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  Xalqaro & Davlat OTMlari
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  Bitiruvchilarimiz Qabul Qilingan Nufuzli Oliygohlar va Talabalar Faxri
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                To'xtatib ko'rish uchun ustiga bosing
              </span>
            </div>

            {/* Track 1: Universitetlar (Chapga oqim) */}
            <div className="mb-3.5">
              <Marquee direction="left" speed={38} pauseOnHover>
                {UNIVERSITIES.map((uni, idx) => (
                  <div
                    key={`uni-${idx}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-400 shadow-sm hover:shadow-sm transition-all duration-200 cursor-default mx-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-base shrink-0">
                      {uni.icon}
                    </div>
                    <div className="text-left whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {uni.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200/70">
                          {uni.badge}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {uni.city}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>

            {/* Track 2: O'quvchilar natijalari (O'ngga oqim) */}
            <div>
              <Marquee direction="right" speed={42} pauseOnHover>
                {STUDENT_ACHIEVEMENTS.map((st, idx) => (
                  <div
                    key={`st-${idx}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50/30 border border-slate-200/80 hover:border-amber-400 shadow-sm hover:shadow-sm transition-all duration-200 cursor-default mx-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-base shrink-0">
                      {st.avatar}
                    </div>
                    <div className="text-left whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {st.name}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white shadow-sm">
                          {st.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {st.detail}
                        </span>
                        <span className="text-[10px] font-bold text-brand-800 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/70">
                          {st.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </ScrollReveal>

        {/* 4. Rasmiy Tasdiqlanganlik va Shaffoflik Eslatmasi */}
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
