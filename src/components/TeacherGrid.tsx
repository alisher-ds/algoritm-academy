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
  BookOpen,
  Sparkles
} from "lucide-react";
import { ECOSYSTEM_DATA } from "@/data/ecosystemData";
import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

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
    return <img loading="lazy" decoding="async" src={image} alt={name} className={className} />;
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
  } else if (sub.includes("sat")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-violet-950",
      ring: "border-violet-400/50 text-violet-300",
      Icon: Sparkles,
      label: "Digital SAT",
    };
  } else if (sub.includes("tarix") || sub.includes("huquq")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-amber-950",
      ring: "border-amber-400/50 text-amber-300",
      Icon: Award,
      label: "Huquq & Tarix",
    };
  } else if (sub.includes("ona tili") || sub.includes("adabiyot")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-indigo-950",
      ring: "border-indigo-400/50 text-indigo-300",
      Icon: BookOpen,
      label: "Ona Tili & Adabiyot",
    };
  } else if (sub.includes("rus") || sub.includes("boshlang'ich")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-rose-950",
      ring: "border-rose-400/50 text-rose-300",
      Icon: BookOpen,
      label: "Boshlang'ich Rus Sinf",
    };
  } else if (sub.includes("pmt") || sub.includes("prezident") || sub.includes("tanqidiy") || sub.includes("mantiq")) {
    theme = {
      gradient: "from-slate-900 via-night-card to-emerald-950",
      ring: "border-brand-400/50 text-brand-300",
      Icon: GraduationCap,
      label: "Prezident Maktabi",
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

/**
 * Rasmiy va haqiqiy Algoritm pedagogik jamoasi.
 *
 * Modul darajasida: ilgari komponent tanasida edi va har render'da (karusel
 * pauzasi, modal ochilishi) 8 ta obyekt qaytadan yaratilardi.
 */
const TEAM_MEMBERS = [
    {
      id: "tm-bobur",
      name: "Bobur Xaydarov",
      role: "Asoschi va Direktor · SAT Math Eksperti",
      subject: "Matematika & SAT Math",
      scoreBadge: "800/800",
      scoreLabel: "SAT MATH",
      qualBadge: "ASOSCHI",
      qualLabel: "DIREKTOR",
      experience: "10+ yil",
      students: "2000+",
      image: "/images/bobur_xaydarov.png",
      videoUrl: "",
      bio: "Algoritm ta'lim ekotizimi asoschisi va direktori. Matematika va SAT Math bo'yicha mutaxassis, rasmiy SAT Math 800/800 (100% maksimal ball) sohibi. Ta'lim sohasida 10 yildan ortiq boshqaruv va pedagogik tajribaga ega.",
      highlights: [
        "SAT Math 800/800 (100% mutlaq natija)",
        "Algoritm Maktabi & Akademiyasi asoschisi",
        "10+ yil ta'lim sohasidagi yetakchilik",
        "Xalqaro olimpiadalar va grantlar koordinatori"
      ],
      isRealVideo: false
    },
    {
      id: "tm-adham",
      name: "Adham Sohibov",
      role: "Prezident Maktabi & Mantiq Murabbiyi",
      subject: "Prezident Maktabi & Matematika",
      scoreBadge: "100+ PM",
      scoreLabel: "QABUL QILINGAN",
      qualBadge: "PMT EXPERT",
      qualLabel: "MALAKA",
      experience: "4+ yil",
      students: "1000+",
      image: "/images/adham_sohibov.png",
      videoUrl: "",
      bio: "Prezident maktabi, Al-Xorazmiy va ixtisoslashtirilgan maktablarga tayyorlov bo'yicha yetakchi murabbiy. Matematika va tanqidiy fikrlash bo'yicha 100 dan ortiq shogirdlari Prezident va Al-Xorazmiy maktablariga qabul qilingan.",
      highlights: [
        "100+ o'quvchisi PM, Al-Xorazmiy va ixtisos maktablarga kirgan",
        "Matematika va tanqidiy fikrlash (Critical Thinking) metodisti",
        "Al-Xorazmiy va Al-Beruniy maktablariga tayyorlov",
        "4+ yil (2022-fevraldan) professional pedagogik faoliyat"
      ],
      isRealVideo: false
    },
    {
      id: "tm-oxunjon",
      name: "Oxunjon Ozodov",
      role: "Digital SAT (English & Math) Mentori",
      subject: "Digital SAT (English & Math)",
      scoreBadge: "SAT 1550",
      scoreLabel: "OFFICIAL SCORE",
      qualBadge: "MATH 800",
      qualLabel: "NYUSH ALUMNI",
      experience: "4+ yil",
      students: "1000+",
      image: "/images/oxunjon_ozodov.png",
      videoUrl: "/videos/oxunjon_teacher_intro.mp4",
      bio: "Digital SAT (English va Math) bo'yicha O'zbekistondagi eng yuqori natijador mentorlardan biri. SAT 1550 va Math 800/800 mutlaq ball sohibi. IELTS 7.5 (Reading 9.0). Nufuzli New York University Shanghai (NYUSH) talabasi.",
      highlights: [
        "SAT 1550 rasmiy xalqaro ball sohibi",
        "SAT Math 800/800 (100% mutlaq natija)",
        "IELTS 7.5 (Reading 9.0 maksimal ball)",
        "NYUSH va xalqaro oliygohlarga 100% grantlar koordinatori"
      ],
      isRealVideo: true
    },
    {
      id: "tm-muhammadali",
      name: "Muhammadali O'rinov",
      role: "Huquq & Tarix Kafedrasi Mudiri",
      subject: "Huquq va Tarix (Milliy Sertifikat)",
      scoreBadge: "500+ SERT",
      scoreLabel: "SHOGIRDLAR",
      qualBadge: "300+ TALABA",
      qualLabel: "OTM GRANT",
      experience: "3+ yil",
      students: "1000+",
      image: "/images/muhammadali_urinov.png",
      videoUrl: "",
      bio: "Huquq va Tarix fanlaridan Milliy sertifikat va DTM imtihonlariga tayyorlovchi yetakchi pedagog. Shogirdlari 500 dan ortiq tarix sertifikatlarini qo'lga kiritgan, 300+ nafari oliygoh talabasi, 10 dan ortiq harbiylar va huquqshunoslar (IIA/HMQA/DXX) kursanti.",
      highlights: [
        "Shogirdlari 500+ tarix milliy sertifikati sohibi",
        "300+ shogirdi nufuzli davlat oliygohlariga qabul qilingan",
        "10+ IIA, HMQA va DXX akademiyalari kursantlari",
        "Xronologik va mantiqiy test tahlili metodikasi"
      ],
      isRealVideo: false
    },
    {
      id: "tm-aziz",
      name: "Aziz Xolmurodov",
      role: "Matematika Kafedrasi Mudiri",
      subject: "Matematika & Milliy Sertifikat",
      scoreBadge: "MILLIY A+",
      scoreLabel: "SERTIFIKAT",
      qualBadge: "200+ A/A+",
      qualLabel: "SHOGIRDLAR",
      experience: "3+ yil",
      students: "1000+",
      image: "/images/aziz_xolmurodov.png",
      videoUrl: "/videos/aziz_teacher_intro.mp4",
      bio: "Algoritm ta'lim tizimining yetakchi matematika ustozi — Milliy sertifikatning eng yuqori A+ darajasi sohibi. O'quvchilar va o'qituvchilar uchun attestatsiya, milliy sertifikat va DTM ga yuqori natijadorlik metodikasi bilan tayyorlaydi. 200+ shogirdi sertifikat sohibi, 300+ nafari oliygohga kirgan.",
      highlights: [
        "Milliy sertifikat (A+) oliy darajasi sohibi",
        "200+ sertifikat sohibi shogirdlar",
        "300+ nufuzli OTM talabalari",
        "O'qituvchilar uchun attestatsiya tayyorlov kursi rahbari"
      ],
      isRealVideo: true
    },
    {
      id: "tm-jasur",
      name: "Jasur Jovliyev",
      role: "Ingliz Tili & CEFR Murabbiyi",
      subject: "Ingliz Tili · CEFR · General English",
      scoreBadge: "IELTS 8.0",
      scoreLabel: "IELTS BAND",
      qualBadge: "CEFR C1",
      qualLabel: "MALAKA",
      experience: "3+ yil",
      students: "600+",
      image: "/images/jasur_jovliyev.png",
      videoUrl: "/videos/jasur_teacher_intro.mp4",
      bio: "Ingliz tili fani bo'yicha rasmiy IELTS 8.0 xalqaro sertifikat sohibi. O'quvchilarda so'zlashuv (Speaking), grammatika va CEFR xalqaro imtihonlariga tayyorgarlik bo'yicha jadal interfaol darslarni olib boradi.",
      highlights: [
        "IELTS 8.0 rasmiy xalqaro sertifikat sohibi",
        "General English & Speaking bo'yicha metodist",
        "CEFR B2/C1 imtihonlariga intensiv tayyorlov",
        "Interfaol muloqot va nutq rivojlantirish tizimi"
      ],
      isRealVideo: true
    },
    {
      id: "tm-shohista",
      name: "Shohista Jalilovna",
      role: "Boshlang'ich Rus Sinf Metodist Ustozi",
      subject: "Boshlang'ich Ta'lim (Rus tilida)",
      scoreBadge: "RUS TILI",
      scoreLabel: "METODIST",
      qualBadge: "MALAKALI USTOZ",
      qualLabel: "KATTA TAJRIBA",
      experience: "Ko'p yillik",
      students: "1000+",
      image: "/images/shohista_jalilovna.png",
      videoUrl: "/videos/shohista_teacher_intro.mp4",
      bio: "Algoritm maktabining boshlang'ich rus sinflari ustozi. Rus tilida boshlang'ich ta'lim bo'yicha ko'p yillik amaliy tajribaga ega malakali pedagoglardan biri. O'quvchilarda dastlabki sinfdanoq to'g'ri talaffuz, savodxonlik va hisoblashni shakllantiradi.",
      highlights: [
        "Maktabning eng malakali boshlang'ich rus sinf ustozlaridan biri",
        "Ko'p yillik amaliy va metodik pedagogik tajriba",
        "1-4 sinf rus tili savodxonligi va mantiqiy tafakkur",
        "Bolalar psixologiyasi va individual ta'lim yondashuvi"
      ],
      isRealVideo: true
    },
    {
      id: "tm-gavhar",
      name: "Jumayeva Gavhar",
      role: "Ingliz Tili Ustozi",
      subject: "Ingliz Tili & Cambridge Standartlari",
      scoreBadge: "MALAKALI",
      scoreLabel: "USTOZ",
      qualBadge: "CAMBRIDGE",
      qualLabel: "MALAKA",
      experience: "9 yil",
      students: "1000+",
      image: "/images/jumayeva_gavhar.png",
      videoUrl: "/videos/gavhar_teacher_intro.mp4",
      bio: "9 yillik professional pedagogik stajga ega malakali ingliz tili ustozi. O'quvchilarni Cambridge standartlari asosida ingliz tili grammatikasi, so'z boyligi va erkin so'zlashuvga o'rgatuvchi tajribali murabbiy.",
      highlights: [
        "9 yillik uzluksiz pedagogik staj",
        "Maktab va akademiya malakali ingliz tili ustozi",
        "Cambridge boshlang'ich va o'rta bosqich metodikasi",
        "Muntazam malaka oshirish sertifikatlari sohibasi"
      ],
      isRealVideo: true
    }
] as const;

type TeamMember = (typeof TEAM_MEMBERS)[number];

export default function TeacherGrid({ onSelectTeacherForConsultation }: TeacherGridProps) {


  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

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

  // 1. Silliq va uzluksiz avtomatik yurish (requestAnimationFrame + IntersectionObserver)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Harakatni kamaytirish sozlamasi tekshiruvi (a11y)
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Boshlang'ich holatni o'rtadagi to'plamga surib qo'yish (ikkala tomonga cheksiz yurishi uchun)
    const initScroll = () => {
      const setWidth = el.scrollWidth / 3;
      if (setWidth > 0 && el.scrollLeft === 0) {
        el.scrollLeft = setWidth;
      }
    };
    initScroll();

    let rafId: number | null = null;
    let lastTime = performance.now();
    let isVisible = true;

    const tick = (now: number) => {
      if (!isVisible) {
        rafId = null;
        return;
      }
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

    // Ekrandan chiqib ketganda CPU/batareyani tejash uchun IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible && rafId === null) {
            lastTime = performance.now();
            rafId = requestAnimationFrame(tick);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
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

  const handleOpenModal = (member: TeamMember) => {
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

  const renderCard = (member: TeamMember, keySuffix: string = "") => (
    // Ilgari bu oddiy `<div onClick>` edi — Tab bilan yuruvchi va ekran o'qigich
    // foydalanuvchisi ustoz profilini umuman ocha olmasdi.
    <div
      key={`${member.id}${keySuffix}`}
      role="button"
      tabIndex={0}
      aria-label={`${member.name} — batafsil ma'lumot`}
      onClick={() => handleOpenModal(member)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedMember(member);
        }
      }}
      className="group relative select-none rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 hover:border-brand-500 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0 w-[220px] sm:w-[255px] focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
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
        <ScrollReveal variant="fade-up" duration={750} delay={100}>
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
                {/* Cheksiz aylanish uchun ro'yxat 3 marta takrorlanadi. Nusxalar
                    `aria-hidden` — aks holda ekran o'qigich 8 ta ustozni 24 marta
                    e'lon qilardi. Faqat o'rtadagi (asosiy) to'plam o'qiladi. */}
                {[0, 1, 2].map((copy) =>
                  TEAM_MEMBERS.map((member, idx) => (
                    <div
                      key={`${member.id}-${copy}-${idx}`}
                      className="shrink-0"
                      aria-hidden={copy !== 1}
                      {...(copy !== 1 ? { inert: "" as unknown as boolean } : {})}
                    >
                      {renderCard(member, `-${copy}-${idx}`)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Reassurance Banner */}
        <ScrollReveal variant="fade-up" duration={700} delay={150}>
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
              href={`tel:+${ECOSYSTEM_DATA.contact.phoneMain.replace(/\D/g, "")}`}
              className="px-6 py-3 rounded-full bg-slate-900 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition shrink-0 shadow-sm flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ustoz Bilan Bog'lanish</span>
            </a>
          </div>
        </ScrollReveal>

      </div>

      {/* DETAILED USER-FRIENDLY VIDEO & PROFILE MODAL */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-modal-title"
            className="relative w-full max-w-3xl bg-night rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white text-left max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-full border border-brand-500/40 shrink-0">
                  <TeacherAvatar
                    name={selectedMember.name}
                    image={selectedMember.image}
                    subject={selectedMember.subject}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                    {selectedMember.role}
                  </span>
                  <h3 id="teacher-modal-title" className="font-display text-lg font-extrabold text-white leading-tight sm:text-xl mt-0.5">
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
                <div className="relative w-full h-80 sm:h-[440px] rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl flex items-center justify-center group">
                  <video
                    src={selectedMember.videoUrl}
                    poster={selectedMember.image}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-white/15 shadow-2xl flex items-center justify-center py-4 sm:py-6 px-4">
                  {/* Orqa fondagi ambient blur glow effekti */}
                  {selectedMember.image && (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-125 pointer-events-none"
                      style={{ backgroundImage: `url(${selectedMember.image})` }}
                    />
                  )}
                  {/* Markazdagi to'liq va ixcham ko'rinadigan rasm */}
                  <div className="relative z-10 h-56 sm:h-64 aspect-[3/3.6] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900">
                    <TeacherAvatar
                      name={selectedMember.name}
                      image={selectedMember.image}
                      subject={selectedMember.subject}
                      className="w-full h-full object-contain"
                    />
                  </div>
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
