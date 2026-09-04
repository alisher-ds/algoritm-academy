"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Play,
  Phone,
  GraduationCap,
  Award,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";

interface TeacherGridProps {
  onSelectTeacherForConsultation?: (teacherName: string) => void;
}

export default function TeacherGrid({ onSelectTeacherForConsultation }: TeacherGridProps) {
  // 10 Team members with Aziz Xolmurodov featured with his real photo and video
  const teamMembers = [
    {
      id: "tm-aziz",
      name: "AZIZ XOLMURODOV",
      role: "Maktab Matematika Ustozi",
      subject: "Matematika & Milliy Sertifikat",
      scoreBadge: "A+",
      scoreLabel: "MILLIY SERTIFIKAT",
      qualBadge: "A+ DARAJA",
      qualLabel: "MALAKA",
      experience: "10 yil",
      students: "3 500+",
      image: "/images/aziz_xolmurodov.png",
      certImage: "/images/demo/cert_math.svg",
      videoUrl: "/videos/aziz_teacher_intro.mp4",
      bio: "Algoritm maktabining matematika ustozi — Milliy sertifikatning eng yuqori A+ darajasi sohibi. O'quvchilarni milliy sertifikat, DTM va xalqaro olimpiada imtihonlariga yuqori natija bilan tayyorlaydi.",
      highlights: [
        "Milliy sertifikat (A+) oliy darajasi",
        "10 yillik professional pedagogik tajriba",
        "3 500+ muvaffaqiyatli o'quvchilar",
        "DTM, SAT Math va olimpiada tayyorlovi"
      ],
      isRealVideo: true
    },
    {
      id: "tm1",
      name: "SHOHRUH JALOLOV",
      role: "Matematika & Olimpiada Mudiri",
      subject: "Fundamental Matematika",
      scoreBadge: "MILLIY A+",
      scoreLabel: "SERTIFIKAT",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "10 yil",
      students: "3 500+",
      image: "/images/demo/mentor_1.svg",
      certImage: "/images/demo/cert_math.svg",
      videoUrl: "",
      bio: "Matematika fanidan Milliy sertifikat (A+) va xalqaro olimpiadalarga tayyorlovchi yetakchi pedagog.",
      highlights: [
        "Milliy sertifikat (A+) maksimal ball natijalari",
        "Prezident va ixtisoslashtirilgan maktablar g'oliblari",
        "Mantiqiy va noan'anaviy masalalar tahlili"
      ],
      isRealVideo: false
    },
    {
      id: "tm2",
      name: "DILRABO AXMEDOVA",
      role: "Boshlang'ich Ta'lim Metodisti",
      subject: "1-4 Sinf Metodikasi",
      scoreBadge: "CAMBRIDGE",
      scoreLabel: "DARAJA",
      qualBadge: "1-TOIFA",
      qualLabel: "MALAKA",
      experience: "12 yil",
      students: "4 200+",
      image: "/images/demo/mentor_2.svg",
      certImage: "/images/demo/cert_ielts.svg",
      videoUrl: "",
      bio: "Boshlang'ich sinf o'quvchilarida husnixat, tezkor hisoblash va mantiqiy tafakkurni shakllantirish bo'yicha mutaxassis.",
      highlights: [
        "1-4 sinf bolalar psixologiyasi mutaxassisi",
        "Mental arifmetika va doiraviy interfaol darslar",
        "12 yillik kuchli tajriba"
      ],
      isRealVideo: false
    },
    {
      id: "tm4",
      name: "FARRUX ALIYEV",
      role: "SAT & Digital Math Eksperti",
      subject: "SAT Digital & AQSH Grantlari",
      scoreBadge: "SAT 1480+",
      scoreLabel: "SAT SCORE",
      qualBadge: "GRANT EXPERT",
      qualLabel: "QUALIFICATION",
      experience: "6 yil",
      students: "1 500+",
      image: "/images/demo/mentor_4.svg",
      certImage: "/images/demo/cert_sat.svg",
      videoUrl: "",
      bio: "AQSH va Yevropaning nufuzli oliygohlariga 100% to'liq grant yutish bo'yicha mutaxassis.",
      highlights: [
        "SAT 1480+ Digital rasmiy ball sohibi",
        "AQSH va xalqaro universitetlar koordinatori",
        "$1.2M+ grantlar koordinatori"
      ],
      isRealVideo: false
    },
    {
      id: "tm5",
      name: "JASUR RAHIMJONOV",
      role: "PMT Mantiq Kafedrasi Mudiri",
      subject: "Prezident Maktabi Tayyorlov",
      scoreBadge: "TOP 1",
      scoreLabel: "PMT QABUL",
      qualBadge: "PMT EXPERT",
      qualLabel: "MALAKA",
      experience: "8 yil",
      students: "2 900+",
      image: "/images/demo/mentor_1.svg",
      certImage: "/images/demo/cert_pmt.svg",
      videoUrl: "",
      bio: "Mantiqiy va tanqidiy fikrlash bo'yicha Prezident va Al-Xorazmiy maktablariga tayyorlovchi yetakchi ekspert.",
      highlights: [
        "PMT 100% qabul ko'rsatkichi",
        "150 daqiqalik sinov simulyatsiyasi",
        "Tanqidiy fikrlash metodisti"
      ],
      isRealVideo: false
    },
    {
      id: "tm6",
      name: "AZIZA NURMATOVA",
      role: "Ingliz Tili & Speaking Murabbiyi",
      subject: "Cambridge Speaking & CEFR",
      scoreBadge: "IELTS 8.5",
      scoreLabel: "IELTS BAND",
      qualBadge: "TESOL",
      qualLabel: "QUALIFICATION",
      experience: "5 yil",
      students: "1 800+",
      image: "/images/demo/mentor_2.svg",
      certImage: "/images/demo/cert_ielts.svg",
      videoUrl: "",
      bio: "Erta yoshdan ingliz tilida ravon gapirish va xalqaro muloqot ko'nikmalarini rivojlantiruvchi ustoz.",
      highlights: [
        "IELTS 8.5 va TESOL xalqaro malaka",
        "Jonli muloqot va interfaol metodika"
      ],
      isRealVideo: false
    },
    {
      id: "tm7",
      name: "BEHZOD QOSIMOV",
      role: "IT & Sun'iy Intellekt Kafedrasi",
      subject: "Python, C++ & Robototexnika",
      scoreBadge: "SENIOR DEV",
      scoreLabel: "DARAJA",
      qualBadge: "AI & ML",
      qualLabel: "YO'NALISH",
      experience: "6 yil",
      students: "2 100+",
      image: "/images/demo/mentor_3.svg",
      certImage: "/images/demo/cert_sat.svg",
      videoUrl: "",
      bio: "Maktab o'quvchilariga zamonaviy dasturlash, sun'iy intellekt va amaliy texnologiyalarni o'rgatuvchi muhandis.",
      highlights: [
        "Python, C++, Java va robototexnika",
        "Sun'iy intellekt laboratoriyasi rahbari"
      ],
      isRealVideo: false
    },
    {
      id: "tm8",
      name: "NILUFAR YUSUPOVA",
      role: "Mental Arifmetika Mutaxassisi",
      subject: "Tezkor Hisob & Shaxmat",
      scoreBadge: "XALQARO",
      scoreLabel: "HAKAM",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "9 yil",
      students: "3 200+",
      image: "/images/demo/mentor_2.svg",
      certImage: "/images/demo/cert_math.svg",
      videoUrl: "",
      bio: "Mental arifmetika bo'yicha xalqaro olimpiadalar g'oliblarini tayyorlagan oliy toifali mutaxassis.",
      highlights: [
        "Xalqaro olimpiadalar hakamlik tajribasi",
        "Tezkor hisoblash va diqqatni jamlash metodikasi"
      ],
      isRealVideo: false
    },
    {
      id: "tm9",
      name: "ODILBEK SHAVKIYEV",
      role: "Fizika & STEM Fanlari Ustozi",
      subject: "Fundamental Fizika & STEM",
      scoreBadge: "MILLIY A+",
      scoreLabel: "SERTIFIKAT",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "14 yil",
      students: "5 000+",
      image: "/images/demo/mentor_4.svg",
      certImage: "/images/demo/cert_sat.svg",
      videoUrl: "",
      bio: "Laboratoriya tajribalari va fizika fanini amaliyot bilan bog'lab o'rgatuvchi tajribali pedagog.",
      highlights: [
        "14 yillik oliy toifali pedagogik faoliyat",
        "Amaliy laboratoriya va STEM darslari"
      ],
      isRealVideo: false
    },
    {
      id: "tm10",
      name: "SARVAR ERGASHEV",
      role: "Robototexnika & Muhandislik",
      subject: "Lego Mindstorms & Arduino",
      scoreBadge: "WRO WINNER",
      scoreLabel: "YUTUQ",
      qualBadge: "STEM EXPERT",
      qualLabel: "MALAKA",
      experience: "5 yil",
      students: "1 400+",
      image: "/images/demo/mentor_1.svg",
      certImage: "/images/demo/cert_pmt.svg",
      videoUrl: "",
      bio: "Xalqaro robototexnika musobaqalari chempioni, bolalarda konstruktorlik tafakkurini rivojlantiruvchi ustoz.",
      highlights: [
        "WRO robototexnika sovrindori",
        "Lego Mindstorms va muhandislik amaliyoti"
      ],
      isRealVideo: false
    },
  ];

  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpenModal = (member: typeof teamMembers[0]) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <section className="bg-white py-24 sm:py-32 text-slate-900 border-b border-slate-200/80" id="ustozlar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-brand-500 text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4" /> Professional Pedagogik Jamoa
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Kuchli Natijador <span className="text-brand-500">Ustozlar Jamoasi</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-normal">
            Har bir ustozning rasmiy sertifikatlari, yutuqlari va tajribasi bilan tanishing.
          </p>
        </div>

        {/* 10-Portrait Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => handleOpenModal(member)}
              className={`group relative rounded-2xl sm:rounded-[24px] overflow-hidden bg-white border cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                member.isRealVideo ? "border-emerald-500 ring-2 ring-emerald-400/30" : "border-slate-200/90 hover:border-emerald-500"
              }`}
            >
              {/* Photo Frame with Glowing Aura & Real Photo Cover */}
              <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-gradient-to-b from-amber-100/50 via-slate-800/40 to-slate-950">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Top Right Floating Frosted Play Button — faqat real video mavjud bo'lsa */}
                {member.isRealVideo && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                )}

                {/* Real Video Badge */}
                {member.isRealVideo && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Video Dars
                    </span>
                  </div>
                )}

                {/* Bottom Content Area */}
                <div className="absolute bottom-3 left-3 right-3 text-left space-y-1.5">
                  
                  {/* Bold Uppercase Name */}
                  <h3 className="text-xs sm:text-[13px] font-black uppercase text-white leading-tight tracking-tight drop-shadow-sm">
                    {member.name}
                  </h3>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    
                    {/* Score Badge */}
                    <div className="rounded-md bg-black/40 backdrop-blur-sm border border-white/10 px-1.5 py-0.5">
                      <span className="block text-[7.5px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                        {member.scoreLabel}
                      </span>
                      <span className="block text-[9.5px] sm:text-[10.5px] font-black uppercase text-amber-400 leading-tight mt-0.5">
                        {member.scoreBadge}
                      </span>
                    </div>

                    {/* Qualification Badge */}
                    <div className="rounded-md bg-black/40 backdrop-blur-sm border border-white/10 px-1.5 py-0.5">
                      <span className="block text-[7.5px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                        {member.qualLabel}
                      </span>
                      <span className="block text-[9.5px] sm:text-[10.5px] font-black uppercase text-white leading-tight mt-0.5 truncate">
                        {member.qualBadge}
                      </span>
                    </div>

                    {/* Experience Badge */}
                    <div className="rounded-md bg-black/40 backdrop-blur-sm border border-white/10 px-1.5 py-0.5">
                      <span className="block text-[7.5px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                        TAJRIBA
                      </span>
                      <span className="block text-[9.5px] sm:text-[10.5px] font-bold text-white leading-tight mt-0.5">
                        {member.experience}
                      </span>
                    </div>

                    {/* Students Badge */}
                    <div className="rounded-md bg-black/40 backdrop-blur-sm border border-white/10 px-1.5 py-0.5">
                      <span className="block text-[7.5px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                        O'QUVCHILAR
                      </span>
                      <span className="block text-[9.5px] sm:text-[10.5px] font-bold text-emerald-400 leading-tight mt-0.5">
                        {member.students}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* CARD FOOTER BAR ("Batafsil" Action) */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 text-[11px] truncate max-w-[95px] sm:max-w-[110px]">
                  {member.subject}
                </span>
                <span className="text-brand-500 font-black uppercase text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Batafsil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Reassurance Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Barcha Ustozlar Davlat va Xalqaro Sertifikatlarga Ega
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                O'qituvchilarimiz doimiy ravishda malaka oshirish kurslari va metodik sinovlardan o'tadi.
              </p>
            </div>
          </div>

          <a
            href={`tel:${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`}
            className="px-6 py-3 rounded-full bg-slate-900 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition shrink-0 shadow-sm flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Ustoz Bilan Bog'lanish</span>
          </a>
        </div>

      </div>

      {/* DETAILED USER-FRIENDLY VIDEO & PROFILE MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-night rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white text-left max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/40 shrink-0">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {selectedMember.role}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white leading-none mt-0.5">
                    {selectedMember.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
              
              {/* Real video bo'lsa — native player, aks holda profil rasmi */}
              {selectedMember.isRealVideo && selectedMember.videoUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl group">
                  <video
                    ref={videoRef}
                    src={selectedMember.videoUrl}
                    poster={selectedMember.image}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-56 sm:h-72 object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                </div>
              )}

              {/* Ustoz Bio & Key Highlights */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ustoz Haqida
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {selectedMember.bio}
                </p>

                {/* Highlights Checkpoints */}
                {selectedMember.highlights && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {selectedMember.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">{selectedMember.scoreLabel}</div>
                  <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">{selectedMember.scoreBadge}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">{selectedMember.qualLabel}</div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">{selectedMember.qualBadge}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Tajriba</div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">{selectedMember.experience}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">O'quvchilar</div>
                  <div className="text-sm sm:text-base font-bold text-brand-400 mt-0.5">{selectedMember.students}</div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    handleCloseModal();
                    if (onSelectTeacherForConsultation) onSelectTeacherForConsultation(selectedMember.name);
                  }}
                  className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>{selectedMember.name} Darsiga Yozilish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
