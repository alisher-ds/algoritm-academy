"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  X,
  Play,
  Phone,
  GraduationCap,
  Award,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Globe,
  Code2,
  Bot,
  Atom,
  BookOpen,
  Brain,
  Sparkles
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";

interface TeacherGridProps {
  onSelectTeacherForConsultation?: (teacherName: string) => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function TeacherAvatar({
  name,
  image,
  subject = "",
  className,
}: {
  name: string;
  image?: string;
  subject?: string;
  className?: string;
}) {
  if (image) {
    return <img src={image} alt={name} className={className} />;
  }

  // Fan yo'nalishi bo'yicha maxsus zamonaviy rang va grafik mavzu
  const sub = subject.toLowerCase();
  let theme = {
    gradient: "from-slate-900 via-night-card to-emerald-950",
    ring: "border-brand-500/50 text-brand-300",
    Icon: Calculator,
    label: "Matematika",
  };

  if (sub.includes("ingliz") || sub.includes("cambridge") || sub.includes("ielts")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-teal-950",
      ring: "border-teal-400/50 text-teal-300",
      Icon: Globe,
      label: "Ingliz Tili",
    };
  } else if (sub.includes("python") || sub.includes("it") || sub.includes("sun'iy")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-cyan-950",
      ring: "border-cyan-400/50 text-cyan-300",
      Icon: Code2,
      label: "IT & Sun'iy Intellekt",
    };
  } else if (sub.includes("robot") || sub.includes("lego") || sub.includes("muhandis")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-sky-950",
      ring: "border-sky-400/50 text-sky-300",
      Icon: Bot,
      label: "Robototexnika",
    };
  } else if (sub.includes("fizika") || sub.includes("stem")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-indigo-950",
      ring: "border-indigo-400/50 text-indigo-300",
      Icon: Atom,
      label: "Fizika & STEM",
    };
  } else if (sub.includes("boshlang'ich") || sub.includes("metodika")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-amber-950",
      ring: "border-amber-400/50 text-amber-300",
      Icon: BookOpen,
      label: "Boshlang'ich Ta'lim",
    };
  } else if (sub.includes("mental") || sub.includes("hisob") || sub.includes("shaxmat")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-purple-950",
      ring: "border-purple-400/50 text-purple-300",
      Icon: Brain,
      label: "Tezkor Hisob",
    };
  } else if (sub.includes("pmt") || sub.includes("mantiq")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-emerald-950",
      ring: "border-brand-400/50 text-brand-300",
      Icon: Sparkles,
      label: "PMT Mantiq",
    };
  }

  const { Icon } = theme;

  return (
    <div
      aria-hidden
      className={`${className} relative flex flex-col items-center justify-center bg-gradient-to-b ${theme.gradient} overflow-hidden`}
    >
      {/* Orqa fondagi nozik fanga oid suv belgisi (watermark) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <Icon className="w-32 h-32 text-white" />
      </div>

      {/* Markaziy elegant muhr va initsiallar */}
      <div className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 ${theme.ring} bg-slate-950/70 backdrop-blur-md flex items-center justify-center shadow-xl`}>
        <span className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {initials(name)}
        </span>
      </div>

      {/* Fanga oid pastki akademik nishon */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
        <Icon className="w-3.5 h-3.5 text-white/90" />
        <span className="text-[10px] font-bold text-white/90 tracking-wide uppercase">
          {theme.label}
        </span>
      </div>
    </div>
  );
}

export default function TeacherGrid({ onSelectTeacherForConsultation }: TeacherGridProps) {
  // 10 Team members with Aziz Xolmurodov featured with his real photo and video
  const teamMembers = [
    {
      id: "tm-aziz",
      name: "Aziz Xolmurodov",
      role: "Maktab Matematika Ustozi",
      subject: "Matematika & Milliy Sertifikat",
      scoreBadge: "A+",
      scoreLabel: "MILLIY SERTIFIKAT",
      qualBadge: "A+ DARAJA",
      qualLabel: "MALAKA",
      experience: "10 yil",
      students: "3 500+",
      image: "/images/aziz_xolmurodov.png",
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
      name: "Shohruh Jalolov",
      role: "Matematika & Olimpiada Mudiri",
      subject: "Fundamental Matematika",
      scoreBadge: "MILLIY A+",
      scoreLabel: "SERTIFIKAT",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "10 yil",
      students: "3 500+",
      image: "",
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
      name: "Dilrabo Axmedova",
      role: "Boshlang'ich Ta'lim Metodisti",
      subject: "1-4 Sinf Metodikasi",
      scoreBadge: "CAMBRIDGE",
      scoreLabel: "DARAJA",
      qualBadge: "1-TOIFA",
      qualLabel: "MALAKA",
      experience: "12 yil",
      students: "4 200+",
      image: "",
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
      name: "Farrux Aliyev",
      role: "SAT & Digital Math Eksperti",
      subject: "SAT Digital & AQSH Grantlari",
      scoreBadge: "SAT 1480+",
      scoreLabel: "SAT SCORE",
      qualBadge: "GRANT EXPERT",
      qualLabel: "QUALIFICATION",
      experience: "6 yil",
      students: "1 500+",
      image: "",
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
      name: "Jasur Rahimjonov",
      role: "PMT Mantiq Kafedrasi Mudiri",
      subject: "Prezident Maktabi Tayyorlov",
      scoreBadge: "TOP 1",
      scoreLabel: "PMT QABUL",
      qualBadge: "PMT EXPERT",
      qualLabel: "MALAKA",
      experience: "8 yil",
      students: "2 900+",
      image: "",
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
      name: "Aziza Nurmatova",
      role: "Ingliz Tili & Speaking Murabbiyi",
      subject: "Cambridge Speaking & CEFR",
      scoreBadge: "IELTS 8.5",
      scoreLabel: "IELTS BAND",
      qualBadge: "TESOL",
      qualLabel: "QUALIFICATION",
      experience: "5 yil",
      students: "1 800+",
      image: "",
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
      name: "Behzod Qosimov",
      role: "IT & Sun'iy Intellekt Kafedrasi",
      subject: "Python, C++ & Robototexnika",
      scoreBadge: "SENIOR DEV",
      scoreLabel: "DARAJA",
      qualBadge: "AI & ML",
      qualLabel: "YO'NALISH",
      experience: "6 yil",
      students: "2 100+",
      image: "",
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
      name: "Nilufar Yusupova",
      role: "Mental Arifmetika Mutaxassisi",
      subject: "Tezkor Hisob & Shaxmat",
      scoreBadge: "XALQARO",
      scoreLabel: "HAKAM",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "9 yil",
      students: "3 200+",
      image: "",
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
      name: "Odilbek Shavkiyev",
      role: "Fizika & STEM Fanlari Ustozi",
      subject: "Fundamental Fizika & STEM",
      scoreBadge: "MILLIY A+",
      scoreLabel: "SERTIFIKAT",
      qualBadge: "OLIY TOIFA",
      qualLabel: "MALAKA",
      experience: "14 yil",
      students: "5 000+",
      image: "",
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
      name: "Sarvar Ergashev",
      role: "Robototexnika & Muhandislik",
      subject: "Lego Mindstorms & Arduino",
      scoreBadge: "WRO WINNER",
      scoreLabel: "YUTUQ",
      qualBadge: "STEM EXPERT",
      qualLabel: "MALAKA",
      experience: "5 yil",
      students: "1 400+",
      image: "",
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

  // Auto-scroll va drag boshqaruvi
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tezlik: soniyasiga ~95px (foydalanuvchiga seziladigan, ravon va professional tezlik)
  const SPEED_PX_PER_SEC = 95;

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const scheduleResume = useCallback((delay = 2000) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current && !isDraggingRef.current) {
        setIsPaused(false);
      }
    }, delay);
  }, []);

  // 1. Silliq va uzluksiz avtomatik yurish (requestAnimationFrame)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Boshlang'ich holatni o'rtadagi to'plamga surib qo'yish (ikkala tomonga cheksiz yurishi uchun)
    const initScroll = () => {
      const setWidth = el.scrollWidth / 3;
      if (setWidth > 0 && el.scrollLeft === 0) {
        el.scrollLeft = setWidth;
      }
    };
    initScroll();

    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (!isPaused && !isDraggingRef.current && !isHoveredRef.current && dt < 100) {
        const px = (SPEED_PX_PER_SEC * dt) / 1000;
        el.scrollLeft += px;

        const setWidth = el.scrollWidth / 3;
        if (setWidth > 0) {
          if (el.scrollLeft >= 2 * setWidth) {
            el.scrollLeft -= setWidth;
          } else if (el.scrollLeft <= 0) {
            el.scrollLeft += setWidth;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [isPaused]);

  // 2. Foydalanuvchi qo'l bilan surganida chegaralarni cheksiz aylantirish
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    if (setWidth > 0) {
      if (el.scrollLeft >= 2 * setWidth) {
        el.scrollLeft -= setWidth;
      } else if (el.scrollLeft <= 10) {
        el.scrollLeft += setWidth;
      }
    }
  }, []);

  // 3. Sichqoncha bilan ushlab surish (Desktop Mouse Drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollLeftRef.current = el.scrollLeft;
    pauseAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      scheduleResume(2000);
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      scheduleResume(1500);
    } else {
      scheduleResume(800);
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    pauseAutoScroll();
  };

  // 4. Barmoq bilan surish (Mobile Touch Events)
  const handleTouchStart = () => {
    pauseAutoScroll();
    hasDraggedRef.current = false;
  };

  const handleTouchMove = () => {
    hasDraggedRef.current = true;
  };

  const handleTouchEnd = () => {
    scheduleResume(2500);
  };

  const handleWheel = () => {
    pauseAutoScroll();
    scheduleResume(2000);
  };

  // 5. Oldinga / Orqaga tugmalari
  const handleStep = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoScroll();
    const stepAmount = 275; // kartochka kengligi + oraliq
    el.scrollBy({ left: direction * stepAmount, behavior: "smooth" });
    scheduleResume(3000);
  };

  const handleOpenModal = (member: typeof teamMembers[0]) => {
    if (hasDraggedRef.current) return;
    setSelectedMember(member);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedMember(null);
  }, []);

  // Escape bilan yopish + orqa fonda scroll bloklash
  useEffect(() => {
    if (!selectedMember) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedMember, handleCloseModal]);

  const renderCard = (member: (typeof teamMembers)[0], keySuffix: string = "") => (
    <div
      key={`${member.id}${keySuffix}`}
      onClick={() => handleOpenModal(member)}
      className="group relative select-none rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 hover:border-brand-500 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0 w-[220px] sm:w-[255px]"
    >
      {/* 1. Toza fotosurat yoki maxsus zamonaviy grafik portret */}
      <div className="relative aspect-[3/3.6] w-full overflow-hidden bg-slate-950">
        <TeacherAvatar
          name={member.name}
          image={member.image}
          subject={member.subject}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Fani bo'yicha nozik burchak yorlig'i */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/15 shadow-sm">
            {member.subject.split("&")[0].trim()}
          </span>
        </div>

        {/* Video mavjud bo'lsa, faqat hover qilinganda nafis Play belgisi */}
        {member.isRealVideo && (
          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Rasm ostidagi toza, tartibli ma'lumotlar bloki (oq fonda) */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white text-left">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-tight line-clamp-1">
            {member.name}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
            {member.role}
          </p>

          {/* 2 ta ixcham nishon (Daraja + Tajriba) */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold font-mono">
              {member.scoreBadge} {member.scoreLabel}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
              {member.experience} tajriba
            </span>
          </div>
        </div>

        {/* Batafsil ma'lumot havolasi */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-bold">
          <span>Batafsil</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-white py-20 sm:py-28 text-slate-900 border-b border-slate-200/80 overflow-hidden" id="ustozlar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <SectionHeader
            eyebrow="Pedagogik jamoa"
            eyebrowIcon={GraduationCap}
            title={<>Kuchli natijador <span className="text-brand-600">ustozlar jamoasi</span></>}
            description="Algoritm ta'lim tizimining tajribali pedagoglari va repetitor-mentorlari."
            wide
            className="mb-0"
          />

          {/* Navigatsiya tugmalari (Oldingisi / Keyingisi) */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => handleStep(-1)}
              aria-label="Oldingi ustozlar"
              title="Oldingisi"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-brand-500 hover:text-white hover:border-brand-500 text-slate-700 shadow-sm flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleStep(1)}
              aria-label="Keyingi ustozlar"
              title="Keyingisi"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-brand-500 hover:text-white hover:border-brand-500 text-slate-700 shadow-sm flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ustozlar interaktiv karuseli — o'zi ravon yuradi, qo'l/sichqoncha bilan suriladi */}
        <div className="relative w-full group/carousel">
          {/* Desktop floating yon tugmalari */}
          <button
            onClick={() => handleStep(-1)}
            aria-label="Oldingi ustozlar"
            className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 shadow-lg border border-slate-200/90 text-slate-700 hover:bg-brand-500 hover:text-white hover:border-brand-500 items-center justify-center transition-all duration-200 active:scale-95 opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStep(1)}
            aria-label="Keyingi ustozlar"
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 shadow-lg border border-slate-200/90 text-slate-700 hover:bg-brand-500 hover:text-white hover:border-brand-500 items-center justify-center transition-all duration-200 active:scale-95 opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Toza ochiq chekka — hech qanday oq tuman yoki niqoblarsiz */}
          <div className="relative w-full overflow-hidden py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {/* Real interaktiv suriluvchi lenta (Touch swipe + Mouse drag + Wheel + RAF Auto-scroll) */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              onMouseEnter={handleMouseEnter}
              className="flex gap-4 sm:gap-5 overflow-x-auto select-none py-2 will-change-scroll cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {[...teamMembers, ...teamMembers, ...teamMembers].map((member, idx) => (
                <div key={`${member.id}-${idx}`} className="shrink-0">
                  {renderCard(member, `-${idx}`)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foydalanuvchiga qisqa eslatma */}
        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-2 font-medium">
          <span>👈 Barmoq yoki sichqoncha bilan surishingiz yoki ustoz kartochkasini bosishingiz mumkin 👉</span>
        </p>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-3xl bg-night rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white text-left max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-full border border-brand-500/40 shrink-0">
                  <TeacherAvatar
                    name={selectedMember.name}
                    image={selectedMember.image}
                    subject={selectedMember.subject}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                    {selectedMember.role}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-white leading-tight sm:text-xl mt-0.5">
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
                <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl">
                  <TeacherAvatar
                    name={selectedMember.name}
                    image={selectedMember.image}
                    subject={selectedMember.subject}
                    className="h-56 w-full object-cover object-top sm:h-72"
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
                        <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
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
                  className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
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
