export interface SchoolProgram {
  id: string;
  gradeRange: string;
  title: string;
  description: string;
  focus: string[];
  schedule: string;
  meals: string;
  badge: string;
}

export interface Course {
  id: string;
  title: string;
  category: "prezident-maktabi" | "aniq-fanlar" | "tillar" | "dasturlash" | "boshlangich" | "tabiiy-fanlar" | "gumanitar";
  categoryLabel: string;
  description: string;
  duration: string;
  weeklyHours: string;
  level: string;
  targetAudience: string;
  features: string[];
  mentor: {
    name: string;
    role: string;
    experience: string;
    rating: number;
  };
  badge?: string;
  isPopular?: boolean;
  days?: string;
  time?: string;
  startDate?: string;
  branch?: string;
  alternateTime?: string;
  status?: string;
  isNewGroup?: boolean;
}

export interface Achievement {
  id: string;
  studentName: string;
  // Diqqat: bu yerga `| string` qo'shmang — u union'ni bekor qiladi va
  // xato yozilgan kategoriya jimgina o'tib ketadi.
  category: "SAT" | "Prezident Maktabi" | "OTM Granti" | "189 Ball" | "Olimpiada" | "Sertifikat" | "Maktab";
  score: string;
  detail: string;
  year: string;
  yearGroup?: "2026" | "2025";
  universityOrCert?: string;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category: "maktab" | "markaz" | "umumiy";
}

/**
 * Sayt kontentining yagona manbasi.
 *
 * `satisfies` qo'llanadi (annotatsiya emas): u literal tiplarni saqlab qoladi,
 * lekin quyidagi interfeyslarga muvofiqlikni majburlaydi. Ilgari interfeyslar
 * eksport qilingan-u hech qayerda ishlatilmasdi — ya'ni kursga `mentor` qo'shishni
 * unutsangiz yoki `category` ni xato yozsangiz TypeScript indamasdi.
 */
export interface EcosystemContent {
  name: string;
  licenseNumber: string;
  stats: { label: string; value: string; icon: string }[];
  contact: {
    phoneMain: string;
    phoneSecondary: string;
    telegram: string;
    instagram: string;
    address: string;
    landmark: string;
    email: string;
    workingHours: string;
  };
  school: {
    name: string;
    tagline: string;
    description: string;
    address: string;
    landmark: string;
    googleMapsUrl: string;
    yandexMapsUrl: string;
    yandexRouteUrl: string;
    coordinates: { lat: number; lng: number };
    phone: string;
    telegram: string;
    workingHours: string;
    stats: { label: string; value: string; icon: string }[];
    programs: SchoolProgram[];
    features: { id: string; title: string; description: string; icon: string; badge: string }[];
    dailySchedule: { time: string; title: string; icon: string }[];
    admissionSteps: { step: string; title: string; description: string }[];
  };
  academy: {
    name: string;
    tagline: string;
    description: string;
    address: string;
    landmark: string;
    googleMapsUrl: string;
    yandexMapsUrl: string;
    yandexRouteUrl: string;
    coordinates: { lat: number; lng: number };
    phone: string;
    phoneSecondary: string;
    workingHours: string;
  };
  courses: Course[];
  achievements: Achievement[];
  faqs: FAQ[];
  gallery: { id: string; title: string; category: string; image: string }[];
}

export const ECOSYSTEM_DATA = {
  name: "Algoritm Academy",
  licenseNumber: "№ 1483319",
  stats: [
    { label: "OTM Talabalari", value: "600+ (150+ Grant)", icon: "GraduationCap" },
    { label: "SAT 1200+ Natijadorlik", value: "100+ (5x 1500+)", icon: "Award" },
    { label: "Prezident & Ixtisos Maktab", value: "300+", icon: "ShieldCheck" },
    { label: "Jami Fan Sertifikatlari", value: "700+", icon: "Sparkles" },
    { label: "Chet Tili Sertifikati (B2+)", value: "50+", icon: "Globe" },
    { label: "Respublika Bosh Mukofoti", value: "60 Mln UZS", icon: "Trophy" },
  ],
  contact: {
    phoneMain: "+998 (90) 895-05-05",
    phoneSecondary: "+998 (88) 895-05-05",
    telegram: "https://t.me/Algoritm_Academy",
    instagram: "https://instagram.com/algoritm.academy",
    address: "Qarshi shahri, Mustaqillik shoh ko'chasi (Geolog MFY)",
    landmark: "Mo'ljal: Yangi Shifoxona qarshisida",
    email: "info@algoritm.uz",
    workingHours: "08:00 - 18:00",
  },
  school: {
    name: "Algoritm School",
    tagline: "0–11 Sinf Chuqurlashtirilgan Xususiy Maktabi",
    description: "Qarshi shahridagi matematika, ingliz tili va IT chuqurlashtirilgan, 3 mahal parhezli issiq ovqat, to'garaklar va to'liq kunlik ta'lim dasturiga ega zamonaviy xususiy maktab.",
    address: "Qarshi shahri, Mustaqillik shoh ko'chasi (Geolog MFY)",
    landmark: "Mo'ljal: Yangi Shifoxona qarshisida",
    googleMapsUrl: "https://maps.app.goo.gl/Rkv1RmfmowBawY5x5",
    yandexMapsUrl: "https://yandex.uz/maps/?pt=65.784375,38.841000&z=17&l=map",
    yandexRouteUrl: "https://yandex.uz/maps/?rtext=~38.841000,65.784375&rtt=auto",
    coordinates: { lat: 38.8410, lng: 65.784375 },
    // Maktab qabul raqami — data_mastery_algoritm.md (message arxivi) asosida
    phone: "+998 (99) 141-05-05",
    telegram: "https://t.me/algoritm_xususiy_maktab",
    workingHours: "08:00 - 18:00",
    stats: [
      { label: "Sinf kvotasi", value: "Qat'iy 15 nafar", icon: "Sparkles" },
      { label: "0-Sinf kvotasi", value: "Atigi 18 o'rin", icon: "Users" },
      { label: "Ta'lim tili", value: "O'zbek & Rus", icon: "Globe" },
      { label: "Xalqaro Olimpiadalar", value: "KHISO, IMEC, JSEO", icon: "Award" },
      { label: "Qabul", value: "0 – 11 sinflar", icon: "GraduationCap" },
      { label: "Sinov darsi", value: "1 kunlik 100% Bepul", icon: "ShieldCheck" },
    ],
    programs: [
      {
        id: "preschool",
        gradeRange: "0-sinf / 4 – 7 yosh",
        title: "0-Sinf & Maktabgacha Tayyorlov",
        description: "0-sinfdanoq robototexnika darslari, o'zbek va rus tayyorlov guruhlari (Nelya Mamadaliyeva, Irina Artikova), har tomonlama aqliy va psixologik tayyorlov (kvota: atigi 18 ta joy).",
        focus: [
          "0-sinfdanoq amaliy Robototexnika mashg'ulotlari",
          "Rus va o'zbek tayyorlov guruhlari (malakali mutaxassislar)",
          "Hisoblash, mantiq va 1-sinfga qulay moslashuv",
          "Shaxmat, karate, mental arifmetika va raqs to'garaklari",
        ],
        schedule: "08:00 - 17:00 (To'liq kun)",
        meals: "3 mahal issiq ovqat",
        badge: "0-Sinf & Tayyorlov",
      },
      {
        id: "primary",
        gradeRange: "1 - 4 sinflar",
        title: "1–4 Sinf: Boshlang'ich & Prezident Maktabi (PMT)",
        description: "Alohida O'zbek va to'liq Rus sinflari. Asosiy maqsad — 4-sinf yakunidagi Prezident maktabi (PMT) imtihonlariga mustahkam poydevor yaratish, chuqurlashtirilgan matematika va ingliz tili.",
        focus: [
          "4-sinf yakunidagi Prezident Maktabi (PMT) imtihoniga to'liq tayyorgarlik",
          "Tanqidiy fikrlash (Critical Thinking), muammoli masalalar va IQ mantiq",
          "Chuqurlashtirilgan matematika va ingliz tili so'zlashuvi",
          "Xalqaro olimpiadalar (KHISO, Kenguru, SEAMO) va Robototexnika",
        ],
        schedule: "08:30 - 17:00 (To'liq kun)",
        meals: "3 mahal issiq ovqat",
        badge: "PMT Poydevori",
      },
      {
        id: "middle",
        gradeRange: "5 - 8 sinflar",
        title: "5–8 Sinf: O'rta Ta'lim & Xalqaro Olimpiadalar",
        description: "Al-Xorazmiy va ixtisoslashtirilgan maktablar dasturi. 5-6 sinflardanoq CEFR va IELTS xalqaro sertifikatlariga tayyorgarlik, xalqaro olimpiadalar markazi va chuqur aniq fanlar.",
        focus: [
          "5-6 sinflardanoq CEFR B1/B2 va IELTS xalqaro sertifikatlari",
          "Xalqaro olimpiadalar markazi (KHISO, IMEC, JSEO, TasIMO)",
          "Al-Xorazmiy va ixtisoslashtirilgan maktablar intensiv tayyorlovi",
          "Chuqur matematika, fizika laboratoriyalari va IT loyihalari",
        ],
        schedule: "08:30 - 17:00 (To'liq kun)",
        meals: "3 mahal issiq ovqat",
        badge: "O'rta Maktab",
      },
      {
        id: "high",
        gradeRange: "9 - 11 sinflar",
        title: "9–11 Sinf: Yuqori Sinf & Xalqaro Grantlar",
        description: "Dunyoning top universitetlariga SAT 1500+ natijalari, 10-sinfdayoq OTMga 189 maksimal ball va Matematika Milliy A+ sertifikatiga repetitorsiz 100% tayyorgarlik.",
        focus: [
          "SAT 1500+ natijasi bilan dunyo oliygohlariga 100% grantlar",
          "O'zbekiston OTMlariga 10-sinfdayoq 189 ball maksimal tayyorlov",
          "Matematika Milliy sertifikat (A+) oliy toifali ustozlar nazoratida",
          "7–10 sinflar uchun 1 yillik bepul o'qish imkonini beruvchi GRAND imtihoni",
        ],
        schedule: "08:30 - 17:30 (Intensiv rejim)",
        meals: "3 mahal to'yimli issiq ovqat",
        badge: "SAT & OTM Granti",
      },
    ],
    features: [
      {
        id: "f1",
        title: "Halol Oshxona & 3 Mahal Issiq Ovqat",
        description: "Taomlarning 100% halolligi va sifatiga qat'iy e'tibor beriladi. Kun davomida 3 mahal issiq ovqat o'qish to'lovi ichida bepul taqdim etiladi.",
        icon: "Utensils",
        badge: "Halol & Sifatli",
      },
      {
        id: "f2",
        title: "15 dan Ortiq Bepul To'garaklar",
        description: "Robototexnika, shaxmat, karate, mental arifmetika, ingliz tili va raqs mashg'ulotlari darsdan so'ng maktab hududida bepul o'tiladi.",
        icon: "Activity",
        badge: "15+ To'garak",
      },
      {
        id: "f3",
        title: "Oylik Stipendiya & GRAND Dasturi",
        description: "Har oy yakunidagi nazorat testida har bir sinfda 1-o'rinni olgan o'quvchilarga maxsus naqd stipendiya hamda yuqori sinflar uchun yillik bepul GRAND granti beriladi.",
        icon: "Sparkles",
        badge: "Rag'bat Tizimi",
      },
      {
        id: "f4",
        title: "Doimiy Shifokor, Yotoqxona & Transport",
        description: "Kunlik tibbiy nazorat, Qarshi shahri bo'ylab xavfsiz transport hamda uzoqdan kelgan o'quvchilar uchun qulay yotoqxona (pansionat) mavjud.",
        icon: "ShieldCheck",
        badge: "Xavfsizlik & Qulaylik",
      },
    ],
    dailySchedule: [
      { time: "08:00 - 08:30", title: "O'quvchilarni kutib olish va ertalabki nonushta", icon: "Coffee" },
      { time: "08:30 - 13:00", title: "Asosiy akademik darslar (Matematika & Tillar)", icon: "BookOpen" },
      { time: "13:00 - 14:00", title: "3 mahal halol issiq tushlik va toza havoda hordiq", icon: "Utensils" },
      { time: "14:00 - 15:30", title: "15+ Bepul to'garaklar (Robototexnika, Shaxmat, Karate, Raqs)", icon: "Bot" },
      { time: "15:30 - 16:30", title: "O'qituvchi nazoratida uyga vazifalarni to'liq bajarish", icon: "PenLine" },
      { time: "16:30 - 17:00", title: "Ikkinchi tushlik (poldnik) va xavfsiz transportda kuzatish", icon: "Bus" },
    ],
    admissionSteps: [
      { step: "01", title: "1 Kunlik BEPUL Sinov Darsi", description: "Farzandingiz bilan kelib darslar, muhit va 3 mahal ovqatlanish jarayoni bilan bepul tanishasiz." },
      { step: "02", title: "Ochiq Eshiklar Kuni", description: "Maktab asoschisi Bobur Xaydarov bilan shaxsan uchrashuv va yillik maxsus chegirmalar taqdimoti." },
      { step: "03", title: "Bilim Darajasi / GRAND Imtihoni", description: "Matematika va ingliz tili monitoringi yoki 7–10 sinflar uchun 1 yillik bepul o'qish granti sinovi." },
      { step: "04", title: "Maktab Safiga Qabul", description: "Qat'iy 15 talik sinf kvotasiga muvofiq o'quvchi rasman Algoritm School oilasiga qabul qilinadi." },
    ],
  },
  academy: {
    name: "Algoritm Academy",
    tagline: "Repetitorlik & O'quv Markazi",
    description: "Prezident maktabiga tayyorlov (PMT), SAT 1500+, IELTS 7+, Matematika Milliy Sertifikat va DTM grant repetitorlik kurslari.",
    address: "Qarshi shahri, Islom Karimov ko'chasi 291V-uy",
    landmark: "Mo'ljal: Zulfina Med klinikasi yonida",
    googleMapsUrl: "https://maps.app.goo.gl/2Grpzgi6X6SeiruA6",
    yandexMapsUrl: "https://yandex.uz/maps/?pt=65.79575,38.84325&z=17&l=map",
    yandexRouteUrl: "https://yandex.uz/maps/?rtext=~38.84325,65.79575&rtt=auto",
    coordinates: { lat: 38.84325, lng: 65.79575 },
    // O'quv markazi raqamlari — data_mastery_algoritm.md asosida
    phone: "+998 (90) 895-05-05",
    phoneSecondary: "+998 (88) 895-05-05",
    workingHours: "08:00 - 20:00",
  },
  courses: [
    {
      id: "pmt-prep",
      title: "Prezident Maktabiga Tayyorlov (PMT)",
      category: "prezident-maktabi" as const,
      categoryLabel: "Prezident Maktabi",
      description: "3-4 sinf o'quvchilari uchun Mantiqiy fikrlash, Tanqidiy tahlil va Cambridge ingliz tili bo'yicha maxsus 150 daqiqalik sinov tizimi.",
      duration: "9 oy",
      weeklyHours: "Haftada 3 kun · 2.5 soat",
      level: "3-4 Sinflar",
      targetAudience: "3-4 sinf iqtidorli o'quvchilari",
      features: [
        "Mantiqiy va tanqidiy fikrlash darslari",
        "Cambridge Primary & A2 Key ingliz tili",
        "Haftalik 150 daqiqalik repetitsion testlar",
        "Psixologik tayyorgarlik va vaqt boshqaruvi",
      ],
      mentor: {
        name: "Adham Sohibov",
        role: "Prezident Maktabi & Mantiq Murabbiyi",
        experience: "4+ yil tajriba",
        rating: 5.0,
      },
      badge: "Top Kurs",
      isPopular: true,
    },
    {
      id: "sat-digital",
      title: "SAT Digital & 100% Xalqaro Grant",
      category: "tillar" as const,
      categoryLabel: "Xalqaro Grant",
      description: "AQSH va xorijiy nufuzli universitetlarga 100% grant yutish uchun SAT Math va Reading & Writing intensiv kursi.",
      duration: "5 oy",
      weeklyHours: "Haftada 3 kun · 2.5 soat",
      level: "Intermediate - Advanced",
      targetAudience: "8-11 sinf o'quvchilari va talabalar",
      features: [
        "SAT 1500+ ball kafolatlangan o'quv rejasi",
        "Digital SAT rasmiy platforma simulyatsiyasi",
        "Xalqaro universitetlarga grant hujjatlarini topshirish",
      ],
      mentor: {
        name: "Oxunjon Ozodov",
        role: "Digital SAT (1550 · Math 800) Mentori",
        experience: "4+ yil tajriba",
        rating: 5.0,
      },
      badge: "SAT 1500+",
      isPopular: true,
    },
    {
      id: "math-dtm",
      title: "Matematika (Milliy Sertifikat A+ & DTM)",
      category: "aniq-fanlar" as const,
      categoryLabel: "Aniq Fanlar",
      description: "5-11 sinflar va abituriyentlar uchun mualliflik metodikasi. Milliy sertifikat (A+) va DTM imtihonlariga kafolatlangan tayyorgarlik.",
      duration: "9 oy",
      weeklyHours: "Haftada 3 kun · 2 soat",
      level: "5-11 Sinflar & Abituriyentlar",
      targetAudience: "Maktab o'quvchilari va abituriyentlar",
      features: [
        "Milliy sertifikat (A+) natijalari kafolati",
        "DTM 30/30 maksimal natija uslubiyoti",
        "Mavzulashtirilgan testlar va doimiy monitoring",
      ],
      mentor: {
        name: "Aziz Xolmurodov",
        role: "Matematika & Milliy Sertifikat Mudiri",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "Mashhur",
      isPopular: true,
    },
    {
      id: "ielts-pro",
      title: "IELTS 7+ & CEFR Intensive",
      category: "tillar" as const,
      categoryLabel: "Chet Tillari",
      description: "Speaking, Writing, Reading va Listening ko'nikmalarini jadal rivojlantirish va xalqaro sertifikat olish kursi.",
      duration: "4-6 oy",
      weeklyHours: "Haftada 3 kun · 2 soat",
      level: "Pre-Intermediate va yuqori",
      targetAudience: "O'quvchilar va yoshlar",
      features: [
        "Shaxsiy IELTS 8.0 sertifikatli ustoz darslari",
        "Haftalik bepul Mock imtihonlari",
        "Erkin muloqot va Speaking klublari",
      ],
      mentor: {
        name: "Jasur Jovliyev",
        role: "IELTS 8.0 & CEFR Murabbiyi",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "Xalqaro sertifikat",
      isPopular: true,
    },
    {
      id: "bio-sertifikat",
      title: "Biologiya — Milliy Sertifikat va 0 dan",
      category: "tabiiy-fanlar" as const,
      categoryLabel: "Tibbiyot & Biologiya",
      description: "Tibbiyot oliygohlari va Ibn Sino nomidagi ixtisoslashtirilgan maktablarga yo'naltirilgan biologiya kursi. Fanni 0 dan boshlovchilar uchun alohida guruh mavjud.",
      duration: "9 oy",
      weeklyHours: "Juft kunlari · 14:00–16:00",
      days: "Juft kunlari",
      time: "14:00–16:00",
      startDate: "03.09.2026",
      alternateTime: "08:00–12:00",
      level: "0 dan & Milliy Sertifikat",
      targetAudience: "Tibbiyot OTM abituriyentlari va Ibn Sino maktabiga tayyorlanuvchilar",
      features: [
        "Milliy sertifikat imtihoni formatidagi tayyorgarlik",
        "Tibbiyot oliygohlari va Ibn Sino maktabi yo'nalishi",
        "0 dan boshlovchilar uchun alohida guruh",
        "Qo'shimcha vaqt varianti: 08:00–12:00",
      ],
      mentor: {
        name: "Tibbiyot Kafedrasi",
        role: "Biologiya & Milliy Sertifikat Mutaxassisi",
        experience: "6+ yil tajriba",
        rating: 5.0,
      },
      badge: "Yangi guruh: 03.09.2026",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "kimyo-sertifikat",
      title: "Kimyo — Milliy Sertifikat",
      category: "tabiiy-fanlar" as const,
      categoryLabel: "Kimyo & Milliy Sertifikat",
      description: "Kimyo fanidan Milliy sertifikat imtihoniga tayyorlov. Ertalabki intensiv rejim — maktab jadvaliga xalaqit bermaydigan vaqt oralig'i.",
      duration: "9 oy",
      weeklyHours: "Toq kunlari · 08:00–10:00",
      days: "Toq kunlari",
      time: "08:00–10:00",
      alternateTime: "10:00–12:00 guruhi",
      status: "Joylar cheklangan",
      level: "Milliy Sertifikat & Al-Beruniy",
      targetAudience: "Abituriyentlar va Al-Beruniy maktabiga nomzodlar",
      features: [
        "Milliy sertifikat imtihoni formatida testlar",
        "Al-Beruniy maktab-internati imtihonining kimyo bloki bilan mos keladi",
        "Muqobil vaqt: 10:00–12:00 guruhi",
        "Maktab jadvaliga xalaqit bermaydigan qulay rejim",
      ],
      mentor: {
        name: "Kimyo Kafedrasi",
        role: "Oliy Toifali Kimyo Mutaxassisi",
        experience: "7+ yil tajriba",
        rating: 5.0,
      },
      badge: "Joylar cheklangan",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "fizika-oliygoh",
      title: "Fizika — Oliygoh & Milliy Sertifikat",
      category: "aniq-fanlar" as const,
      categoryLabel: "Fizika",
      description: "Fizikadan oliygohga kirish va Milliy sertifikat uchun tayyorlov. Al-Beruniy nomidagi xalqaro maktab-internat imtihonining fizika blokini ham qamrab oladi.",
      duration: "9 oy",
      weeklyHours: "Toq kunlari · 14:00–16:00",
      days: "Toq kunlari",
      time: "14:00–16:00",
      branch: "Markaz filiali",
      level: "Oliygoh & Milliy Sertifikat",
      targetAudience: "Texnika oliygohlari va Al-Beruniy maktabiga tayyorlanuvchilar",
      features: [
        "Oliygoh imtihoniga yo'naltirilgan mavzular ketma-ketligi",
        "Al-Beruniy maktab-internati fizika bloki",
        "Katta tajribaga ega ustoz tomonidan olib boriladi",
        "Murakkab masalalarni tezkor yechish texnikalari",
      ],
      mentor: {
        name: "Fizika Kafedrasi",
        role: "Katta Tajribali Fizika Ustozi",
        experience: "8+ yil tajriba",
        rating: 5.0,
      },
      badge: "Al-Beruniy bloki",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "english-beginner",
      title: "Ingliz tili — Beginner (0 dan)",
      category: "tillar" as const,
      categoryLabel: "Ingliz Tili (0 dan)",
      description: "Ingliz tilini butunlay noldan boshlaydiganlar uchun asosiy guruh. 5–8-sinf o'quvchilari uchun alohida yosh guruhi ham mavjud.",
      duration: "4 oy",
      weeklyHours: "Toq kunlari · 14:00–16:00",
      days: "Toq kunlari",
      time: "14:00–16:00",
      startDate: "02.09.2026",
      alternateTime: "Ertalabki (08:00–12:00) va kechki (18:00–20:00) variantlar",
      status: "Joylar soni cheklangan",
      level: "Beginner (0 dan)",
      targetAudience: "5–8-sinflar va noldan o'rganuvchilar",
      features: [
        "Alifbodan boshlab, CEFR va IELTS bosqichlariga ulanadigan dastur",
        "5–8-sinflar uchun alohida 0 dan ingliz tili guruhi",
        "Ertalabki (08:00–12:00) va kechki (18:00–20:00) variantlar",
        "Joylar soni cheklangan",
      ],
      mentor: {
        name: "Asadbek Boymamatov",
        role: "Ingliz Tili Murabbiyi · CEFR C1",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "Yangi guruh: 02.09.2026",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "math-beginner-5-8",
      title: "Matematika 0 dan — 5–8-sinflar",
      category: "aniq-fanlar" as const,
      categoryLabel: "Matematika 5-8 Sinf",
      description: "5–8-sinf o'quvchilari uchun matematikani noldan mustahkamlash guruhi. Milliy sertifikat va maktab imtihonlari yo'nalishlariga o'tishdan oldingi baza.",
      duration: "6 oy",
      weeklyHours: "Toq kunlari · 14:00–16:00",
      days: "Toq kunlari",
      time: "14:00–16:00",
      startDate: "07.09.2026",
      alternateTime: "4 soatlik SUPER format: 08:30–12:30 · 10:00–12:00 · 16:00–18:00",
      level: "5–8 Sinf Bazasi",
      targetAudience: "5–8 sinf o'quvchilari",
      features: [
        "Maktab dasturidagi bo'shliqlarni to'ldirishga yo'naltirilgan",
        "4 soatlik SUPER format varianti: 08:30–12:30",
        "Ertalab 10:00–12:00 va kechqurun 16:00–18:00 guruhlari",
        "Bitirgach Al-Xorazmiy / Milliy sertifikat guruhlariga o'tish",
      ],
      mentor: {
        name: "Asadbek To'rayev",
        role: "Matematika Murabbiyi · Milliy Sertifikat A",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "Yangi guruh: 07.09.2026",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "ona-tili-sertifikat",
      title: "Ona tili — Milliy Sertifikat va Majburiy",
      category: "gumanitar" as const,
      categoryLabel: "Ona Tili & Adabiyot",
      description: "Ona tili va adabiyotdan Milliy sertifikat, majburiy blokni yopish hamda DTM va o'qishni ko'chirish uchun grammatika — uch xil maqsadga uch xil guruh.",
      duration: "9 oy",
      weeklyHours: "Toq / juft kunlari · 14:00–16:00 / 16:00–18:00",
      days: "Toq / juft kunlari",
      time: "14:00–16:00 / 16:00–18:00",
      level: "Milliy Sertifikat & DTM Majburiy",
      targetAudience: "Abituriyentlar va talabalar",
      features: [
        "Milliy sertifikat guruhi — yuqori darajadagi sertifikat uchun",
        "Majburiy guruh — imtihonda 10/10 natija uchun",
        "Grammatika guruhi — DTM va o'qishni ko'chirish uchun",
        "Shogirdlari orasida 100% lik milliy sertifikat natijalari qayd etilgan",
      ],
      mentor: {
        name: "Shohjahon Shoyqulov",
        role: "Ona Tili Bosh Ustozi · A+ Daraja",
        experience: "12 yil tajriba",
        rating: 5.0,
      },
      badge: "100% Milliy Natija",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "huquq-sertifikat",
      title: "Huquq — Milliy Sertifikat",
      category: "gumanitar" as const,
      categoryLabel: "Huquqiy Ta'lim",
      description: "Huquq fanidan Milliy sertifikat joriy etilgandan so'ng ochilgan yo'nalish. Maxsus «Huquqiy status» qo'llanmasi, mavzulashtirilgan va imtihon formatidagi testlar asosida tizimli tayyorgarlik.",
      duration: "6 oy",
      weeklyHours: "16:00 dan",
      time: "16:00 dan",
      branch: "Huquq | Tarix filiali",
      status: "2 guruh to'ldi",
      level: "Milliy Sertifikat & Akademiya",
      targetAudience: "Yuridik va harbiy akademiya abituriyentlari",
      features: [
        "«Huquqiy status» — maxsus ishlab chiqilgan tayyorgarlik qo'llanmasi",
        "VM ning 411-son qarori talablariga moslangan dastur",
        "Shogirdlari: 11 nafari TDYU, 5 nafari Ichki ishlar akademiyasi talabasi",
        "Maqsad — huquqni yodlatish emas, anglatish va natija qilish",
      ],
      mentor: {
        name: "Muhammadali O'rinov",
        role: "Huquq & Tarix Kafedrasi Mudiri",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "2 guruh to'ldi",
      isPopular: true,
      isNewGroup: true,
    },
    {
      id: "tarix-sertifikat",
      title: "Tarix — Milliy Sertifikat va Majburiy",
      category: "gumanitar" as const,
      categoryLabel: "Tarix",
      description: "Tarix fanidan asosiy (sertifikat) va majburiy blokni yopish uchun ikki alohida guruh. Yo'nalishning e'lon qilingan ko'rsatkichi — 200 o'quvchidan 186 tasida natija.",
      duration: "9 oy",
      weeklyHours: "Majburiy 10:00–12:00 · Asosiy fan 14:00–16:00",
      time: "Majburiy 10:00–12:00 · Asosiy 14:00–16:00",
      branch: "Huquq | Tarix filiali",
      level: "Asosiy Fan & Majburiy Blok",
      targetAudience: "Abituriyentlar va 189.0 ball maqsad qilganlar",
      features: [
        "200 ta o'quvchidan 186 tasi natija qayd etgan (e'lon qilingan ko'rsatkich)",
        "5 nafar shogirdi 189 ball bilan JIDU talabasi bo'ldi",
        "8 nafar shogirdi 180+ ball bilan tarix yo'nalishidagi eng yaxshi OTMlarga kirdi",
        "Rekordchilar sertifikatlari alohida kanalda e'lon qilinadi",
      ],
      mentor: {
        name: "Muhammadali O'rinov",
        role: "Huquq & Tarix Kafedrasi Mudiri",
        experience: "3+ yil tajriba",
        rating: 5.0,
      },
      badge: "186/200 Natijadorlik",
      isPopular: true,
      isNewGroup: true,
    },
  ],
  achievements: [
    // ==========================================
    // 2026-YIL MA'LUMOTLARI (JORIY MAVSUM)
    // ==========================================
    {
      id: "a-axmatov-26",
      studentName: "Respublika Fan Olimpiadasi Chempioni",
      category: "Olimpiada",
      score: "Respublika 1-O'rin (94 Ball)",
      detail: "Katta Yutuqli Olimpiada (KYO, Toshkent) saralangan 150 nafar eng kuchli iqtidor orasida mutlaq 1-o'rinni egallab, 60 000 000 so'mlik bosh pul mukofotini qo'lga kiritdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "60 000 000 so'm Bosh Mukofot",
    },
    {
      id: "a-fayzullayeva-26",
      studentName: "Digital SAT 1520 Sohibi",
      category: "SAT",
      score: "SAT 1520 Ball",
      detail: "CollegeBoard Digital SAT xalqaro imtihonida dunyo bo'yicha eng yuqori 1 foizlik natija (Math 790, EBRW 730) qayd etib, guruhda 1-o'rinni egalladi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Top 1% Global",
    },
    {
      id: "a-mamanazarov-26",
      studentName: "Digital SAT 1500 Natijasi",
      category: "SAT",
      score: "SAT 1500 Ball",
      detail: "Digital SAT xalqaro imtihonida 1500 ballik nufuzli natijani qayd etib, SAT 1500+ elita klubi a'zosi bo'ldi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "SAT 1500+ Klubi",
    },
    {
      id: "a-sat-1480-trio",
      studentName: "Digital SAT 1480 Natijalari (3 Nafar)",
      category: "SAT",
      score: "SAT 1480 Ball (3 Nafar)",
      detail: "Ixtisoslashtirilgan guruhning 3 nafar o'quvchisi bir vaqtning o'zida 1480 ballik yuqori natijaga erishdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "SAT 1480 Natija",
    },
    {
      id: "a-sat-1430-26",
      studentName: "Digital SAT 1430 & IELTS 6.5",
      category: "SAT",
      score: "SAT 1430 · IELTS 6.5",
      detail: "Maktab o'quvchisi: darslar davomida 5 oylik tayyorgarlik natijasida SAT 1430 va IELTS 6.5 ball to'plab, to'liq davlat grantini kafolatladi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Maktab O'quvchisi",
    },
    {
      id: "a-sherbek-26",
      studentName: "Digital SAT Math 790 (9-Sinf)",
      category: "SAT",
      score: "SAT 1270 (Math 790)",
      detail: "Atigi 9-sinf o'quvchisi bo'lishiga qaramay SAT Math qismidan 790 ball olib, muddatidan oldin davlat grantini naqd qildi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "9-Sinfda SAT Granti",
    },
    {
      id: "a-27grants-26",
      studentName: "27 Nafar SAT Davlat Granti",
      category: "OTM Granti",
      score: "4 Yillik 100% Davlat Granti",
      detail: "Faqat SAT imtiyozi orqali 27 nafar o'quvchi Iqtisodiyot, Milliy universitet, IT va Diplomatiya yo'nalishlariga 4 yillik to'liq byudjet grantiga qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "27 Nafar To'liq Grant",
    },
    {
      id: "a-mirfayz-26",
      studentName: "189.0 Ball (4x Davlat Granti)",
      category: "189 Ball",
      score: "189.0 Ball (4x Byudjet)",
      detail: "Muddatidan oldin birdaniga 4 ta ta'lim yo'nalishi bo'yicha maksimal 189.0 ball to'plab, to'liq byudjet grantiga kirdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "4 Yo'nalishda 189.0 Byudjet",
    },
    {
      id: "a-tojiyev-26",
      studentName: "189.0 Ball (2x Davlat Granti)",
      category: "189 Ball",
      score: "189.0 Ball (2x Byudjet)",
      detail: "Muddatidan oldin maksimal 189 ball to'plab, birdaniga ikki yetakchi oliygoh davlat grantiga qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Ikki Oliygoh Byudjet",
    },
    {
      id: "a-aliqulova-26",
      studentName: "189.0 Ball (Diplomatiya Sohasi)",
      category: "189 Ball",
      score: "189.0 Ball · Davlat Granti",
      detail: "Muddatidan oldin 189 ball to'plab, xalqaro munosabatlar va diplomatiya sohasidagi oliygohga to'liq davlat granti asosida kirdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Diplomatiya Davlat Granti",
    },
    {
      id: "a-samadov-26",
      studentName: "189.0 Ball (Yuridik Sohasi)",
      category: "189 Ball",
      score: "189.0 Ball · Davlat Granti",
      detail: "Poytaxt yuridik oliygohiga 189.0 maksimal ball bilan 100% davlat granti asosida qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Yuridik Davlat Granti",
    },
    {
      id: "a-ovlayev-26",
      studentName: "189.0 Ball (Xalqaro Munosabatlar)",
      category: "189 Ball",
      score: "189.0 Ball · Davlat Granti",
      detail: "Xalqaro munosabatlar oliygohiga 189.0 maksimal ball bilan to'liq davlat granti asosida talabalikka qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Xalqaro Soha Granti",
    },
    {
      id: "a-berdinazarov-26",
      studentName: "Iqtisodiyot Sohasi Davlat Granti",
      category: "OTM Granti",
      score: "100% Davlat Granti",
      detail: "178 ball va Matematika A+ milliy sertifikati orqali yetakchi iqtisodiyot OTMiga davlat granti asosida qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Iqtisodiyot Davlat Granti",
    },
    {
      id: "a-asila-ielts8",
      studentName: "IELTS 8.0 Xalqaro Sertifikati",
      category: "Sertifikat",
      score: "IELTS 8.0 Ball",
      detail: "Xalqaro IELTS imtihonida 8.0 ballik yuqori natijani qayd etib, OTMlarga to'liq imtiyozni qo'lga kiritdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "IELTS 8.0 Xalqaro",
    },
    {
      id: "a-pm-2026",
      studentName: "Prezident Maktablari 5 Nafar Qabul",
      category: "Prezident Maktabi",
      score: "5 Nafar 100% Davlat Granti",
      detail: "Yakuniy bosqichda viloyat bo'yicha eng yuqori o'rinlarni zabt etishdi: 4-o'rin (83.5 ball), 12-o'rin (81.0), 14-o'rin (80.5), 15-o'rin (80.5), 21-o'rin (78.5).",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Prezident Maktabi Qabullari",
    },
    {
      id: "a-alxorazmiy-26",
      studentName: "Al-Xorazmiy Maktablari Qabuli",
      category: "Prezident Maktabi",
      score: "44 Nafar Qabul (14x O'sish)",
      detail: "4-sinflar kesimida 22 nafar, 5–9-sinflar kesimida 22 nafar o'quvchi Al-Xorazmiy ixtisoslashgan maktablariga qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Al-Xorazmiy 44 Nafar",
    },
    {
      id: "a-muhandislik-26",
      studentName: "Muhandislik Maktabi Qabuli",
      category: "Prezident Maktabi",
      score: "25 Nafar Qabul",
      detail: "2026-yilda yangi ochilgan ixtisoslashtirilgan muhandislik maktabiga birdaniga 25 nafar o'quvchimiz qabul qilindi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Muhandislik Maktabi",
    },
    {
      id: "a-pmt-saralash-26",
      studentName: "PMT 1-Bosqich Saralashi",
      category: "Prezident Maktabi",
      score: "82 Nafar (135 dan 82 / 61%)",
      detail: "Prezident maktabi 1-bosqichida 135 nafar o'quvchidan 82 nafari saralashdan muvaffaqiyatli o'tib, 2-bosqichga yo'llanma oldi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "61% Saralash Konversiyasi",
    },
    {
      id: "a-samir-26",
      studentName: "10-Sinf Multi-Sertifikat Sohibi",
      category: "Sertifikat",
      score: "4 Ta Fan Sertifikati",
      detail: "10-sinfdayoq tarix, ona tili, matematika va ingliz tili fanlaridan milliy sertifikatlarni olib, muddatidan oldin talabalikni naqd qildi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "10-Sinf Multi-Sertifikat",
    },
    {
      id: "a-toychiyev-26",
      studentName: "10-Sinf Multi-Sertifikat Sohibi",
      category: "Sertifikat",
      score: "4 Ta Fan Sertifikati",
      detail: "10-sinf o'quvchisi 4 ta fandan sertifikat olib, muddatidan oldin barcha imtiyozlarni qo'lga kiritdi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "10-Sinf Multi-Sertifikat",
    },
    {
      id: "a-abduhamidov-26",
      studentName: "Boshlang'ich Sinf Xalqaro Medallari",
      category: "Maktab",
      score: "3x Xalqaro Medal · 8x Stipendiya",
      detail: "Maktab 3-«A» sinf o'quvchisi: matematika xalqaro olimpiadalarida 3 ta sovrin va har oylik testlarda 8 marotaba maktab stipendiyasi sohibi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Maktab Faxri · 3-Sinf",
    },
    {
      id: "a-tasimo-26",
      studentName: "Viloyat Fan Olimpiadasi 1-O'rin",
      category: "Olimpiada",
      score: "TasIMO Viloyat 1-O'rin (88%)",
      detail: "TasIMO olimpiadasining viloyat bosqichida 88% ko'rsatkich bilan 1-o'rinni egallab, respublika finaliga yo'llanma oldi.",
      year: "2026",
      yearGroup: "2026",
      universityOrCert: "Respublika Yo'llanmasi",
    },

    // ==========================================
    // 2025-YIL MA'LUMOTLARI (TO'LIQ YIL)
    // ==========================================
    {
      id: "a-firdavs-25",
      studentName: "Digital SAT 1510 Natijasi",
      category: "SAT",
      score: "SAT 1510 Ball",
      detail: "2025-yil Digital SAT imtihonida 1510 ballik yuqori natijaga erishib, O'zbekiston va xalqaro universitetlar grantiga ega bo'ldi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "SAT 1500+ Klubi",
    },
    {
      id: "a-xasanova-25",
      studentName: "Digital SAT 1500 Natijasi",
      category: "SAT",
      score: "SAT 1500 Ball",
      detail: "Digital SAT imtihonida ketma-ket 1480 va 1500 ball to'plab, 1500+ klubi yetakchilaridan biriga aylandi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "SAT 1500+ Klubi",
    },
    {
      id: "a-munisa-25",
      studentName: "Digital SAT 1470 Natijasi",
      category: "SAT",
      score: "SAT 1470 Ball",
      detail: "2025-yilgi SAT imtihonida 1470 ball to'plab, nufuzli grantlar guruhidan joy oldi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "SAT 1450+ Natija",
    },
    {
      id: "a-qudratov-25",
      studentName: "Digital SAT 1470 Natijasi",
      category: "SAT",
      score: "SAT 1470 Ball",
      detail: "Digital SAT sinovida 1470 ball natija qayd etib, nufuzli ta'lim imtiyozini qo'lga kiritdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "SAT 1450+ Natija",
    },
    {
      id: "a-ismoyilov-25",
      studentName: "Digital SAT Math 800/800 Maksimal",
      category: "SAT",
      score: "SAT 1460 (Math 800)",
      detail: "SAT imtihonida matematika qismidan 800/800 maksimal ball to'plab, umumiy 1460 ball natijani ko'rsatdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "SAT Math 800/800",
    },
    {
      id: "a-shohjahon-25",
      studentName: "Digital SAT 1430 (8-Sinf / 14 Yosh)",
      category: "SAT",
      score: "SAT 1430 Ball",
      detail: "Atigi 8-sinfda, 14 yoshida bor-yo'g'i 6 oylik tayyorgarlik bilan SAT 1430 ball to'pladi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "8-Sinfda SAT 1430",
    },
    {
      id: "a-berdiyorova-25",
      studentName: "189.0 Maksimal Ball (Muddatidan Avval)",
      category: "189 Ball",
      score: "189.0 Maksimal Ball",
      detail: "Matematika A+ (100%), Ingliz tili B2 (100%), Ona tili B (88%), Tarix C+ (83%) sertifikatlari orqali 189.0 ball to'plab, muddatidan avval talaba bo'ldi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Muddatidan Avval 189.0",
    },
    {
      id: "a-urinov-2025-jamlanma",
      studentName: "Gumanitar va Huquq Yo'nalishi",
      category: "OTM Granti",
      score: "~250 Nafar Talaba (2025)",
      detail: "2025-yil yakuni bo'yicha: harbiy akademiya, xavfsizlik akademiyasi, ichki ishlar akademiyasi, 40 dan ortiq yuridik yo'nalishlari va 200 ga yaqin boshqa yo'nalishlar talabalari.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "250+ Talaba (2025)",
    },
    {
      id: "a-sanjar-vohidov",
      studentName: "Huquq-tartibot Akademiyasi (Davlat Granti)",
      category: "OTM Granti",
      score: "326.6 Ball Davlat Granti",
      detail: "Huquqni muhofaza qilish akademiyasining maxsus yo'nalishiga 326.6 ball bilan davlat granti asosida qabul qilindi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Maxsus Akademiya Granti",
    },
    {
      id: "a-rayhonov-inha",
      studentName: "Xalqaro Texnologiya OTMi Talabasi",
      category: "OTM Granti",
      score: "Xalqaro OTM Qabuli",
      detail: "Atigi 3 oy matematika o'qib, nufuzli xalqaro texnologiya universiteti (Toshkent) talabasi bo'ldi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Xalqaro OTM Talabasi",
    },
    {
      id: "a-qurbonov-westminster",
      studentName: "Xalqaro Nufuzli OTM Talabasi",
      category: "OTM Granti",
      score: "Xalqaro Universitet",
      detail: "Toshkentdagi xalqaro nufuzli universitet talabaligiga tavsiya etildi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Xalqaro OTM Talabasi",
    },
    {
      id: "a-pm-2025",
      studentName: "Prezident Maktabi 2025 Qabullari",
      category: "Prezident Maktabi",
      score: "6 Nafar Qabul (4, 10, 13, 17, 19...)",
      detail: "Prezident maktabiga viloyat bo'yicha 4-o'rin (82.5 ball), 10-o'rin (78.0), 13-o'rin (77.0), 17-o'rin (75.5), 19-o'rin (75.5), 24-o'rin (73.0) bilan qabul qilindi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "6 Nafar PM Qabul",
    },
    {
      id: "a-pm-saralash-2025",
      studentName: "PMT 2025 Saralash Bosqichi",
      category: "Prezident Maktabi",
      score: "38 Nafar (4 tasi 100%)",
      detail: "Viloyat bo'yicha eng kuchli 480 talikka 38 nafar o'quvchimiz kirdi, viloyatdagi 11 nafar 100% olganning 4 nafari o'quvchimiz bo'ldi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Saralashda 4 Ta 100%",
    },
    {
      id: "a-khiso-2025",
      studentName: "KHISO 2025 Sovrindorlari",
      category: "Olimpiada",
      score: "1-O'rin, 3-O'rin, 4-O'rin",
      detail: "Xalqaro KHISO olimpiadasida 5-sinflar kesimida 1-o'rin, 4-sinflar kesimida 3-o'rin va 4-o'rin qo'lga kiritildi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "KHISO Sovrindorlari",
    },
    {
      id: "a-copernicus-2025",
      studentName: "COPERNICUS Xalqaro Bronza Medali",
      category: "Olimpiada",
      score: "COPERNICUS Bronza Medali",
      detail: "3-sinf o'quvchisi xalqaro COPERNICUS olimpiadasida bronza medalini olib, AQSHdagi 2-bosqichga yo'llanma yutdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "AQSHga Yo'llanma",
    },
    {
      id: "a-boboqulov-stem",
      studentName: "STEM Xalqaro Oltin Medali",
      category: "Olimpiada",
      score: "STEM Xalqaro Oltin Medali",
      detail: "Sobiq o'quvchimiz xalqaro STEM fan olimpiadasida oltin medalni qo'lga kiritdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "Xalqaro Oltin Medal",
    },
    {
      id: "a-ielts-6-5-25",
      studentName: "IELTS 6.5 Xalqaro Sertifikati",
      category: "Sertifikat",
      score: "IELTS 6.5 Ball",
      detail: "Maktab o'quvchisi 2025-yil kuzida xalqaro IELTS 6.5 sertifikatini qo'lga kiritdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "IELTS 6.5",
    },
    {
      id: "a-cefr-11-2025",
      studentName: "11 Nafar CEFR B2 Egalari",
      category: "Sertifikat",
      score: "11 Nafar CEFR B2 Sertifikati",
      detail: "2025-yilda 11 nafar o'quvchimiz davlat multilevel imtihonida B2 sertifikatini qo'lga kiritdi.",
      year: "2025",
      yearGroup: "2025",
      universityOrCert: "11 Nafar B2 Sertifikat",
    },
  ],
  faqs: [
    {
      category: "maktab" as const,
      question: "Maktabda telefon va smartfonlardan foydalanish tartibi qanday?",
      answer: "Dars boshlanishidan oldin barcha o'quvchilarning smartfonlari maxsus xavfsiz qutilarda saqlashga olinadi. Dars va tanaffus paytida bolalar faqat jonli muloqot, sport, kitobxonlik va to'garaklar bilan band bo'ladi. Soat 17:00 da darslar tugagach, ota-onasi bilan bog'lanish uchun qaytarib beriladi.",
    },
    {
      category: "umumiy" as const,
      question: "Maktabingizda o'qisa, qo'shimcha repetitorga borishga hojat qoladimi?",
      answer: "Mutlaqo yo'q. Algoritm Maktabi va Akademiyasining asosiy ustunligi — kuchli o'quv markazi (Prezident maktabiga tayyorlov, SAT, IELTS, Milliy sertifikat A+, DTM) bilan bitta ekotizimdaligidir. Fanlarni chuqurlashtirilgan o'rganish, imtihonlarga intensiv tayyorgarlik va barcha uy vazifalari soat 17:00 gacha maktabning o'zida kuchli ustozlar nazoratida to'liq yakunlanadi.",
    },
    {
      category: "maktab" as const,
      question: "Maktabni bitirganda beriladigan attestat davlatnikidan farq qiladimi va eMaktab tizimiga ulanganmi?",
      answer: "Maktab davlat litsenziyasiga ega bo'lib, bitiruvchilarga O'zbekiston Respublikasi Xalq ta'limi vazirligi tasdiqlagan rasmiy davlat namunisidagi attestat (shahodatnoma) beriladi. Maktab to'liq eMaktab (avvalgi Kundalik.com) davlat platformasiga integratsiya qilingan, barcha baholar rasmiy bazada yuritiladi.",
    },
    {
      category: "maktab" as const,
      question: "3 mahal ovqatlanish, tibbiyot va xavfsizlik qanday ta'minlangan?",
      answer: "Taomlar maktabning shaxsiy oshxonasida sanitariya me'yorlari asosida faqat halol, toza va tabiiy mahsulotlardan yangi pishiriladi (parhez va allergik talablar inobatga olinadi). Maktab binosi 24/7 videokuzatuv va qo'riqlash xizmatida. Shuningdek, kun bo'yi malakali shifokor va maktab psixologi faoliyat ko'rsatadi.",
    },
    {
      category: "maktab" as const,
      question: "O'quv yili o'rtasida boshqa maktabdan Algoritmga ko'chirish (perevod) mumkinmi?",
      answer: "Ha, sinflarda bo'sh kvota o'rinlari mavjud bo'lsa, o'quv yili davomida ham o'tish mumkin. Jarayon juda oson: o'quvchi 1 kunlik bepul sinov darsida qatnashadi va bilim darajasi aniqlanadi, so'ngra hujjatlar elektron tizim orqali tez va qog'ozbozliksiz rasmiylashtiriladi.",
    },
    {
      category: "umumiy" as const,
      question: "Oylik to'lovdan tashqari kutilmagan yashirin xarajatlar bormi va qanday chegirmalar mavjud?",
      answer: "Hech qanday yashirin to'lov yo'q — 3 mahal issiq ovqat, 15+ to'garaklar, darsdan keyingi uy vazifalari va barcha qo'shimcha darslar oylik to'lov ichiga kiradi. Bir oiladan 2 yoki undan ortiq farzand o'qisa oilaviy chegirma beriladi. Shuningdek, yuqori sinflar uchun GRAND imtihoni orqali 100% bepul o'qish grantlari mavjud.",
    },
    {
      category: "markaz" as const,
      question: "O'quv markazi (kurslar)da 1-dars rostdan ham bepulmi va o'zlashtirish qanday nazorat qilinadi?",
      answer: "Ha, istalgan kursimizda (PMT, SAT, IELTS, Matematika) birinchi sinov darsi 100% bepul. O'quvchi ustoz va muhitni o'zi ko'rib baholaydi. Har bir o'quvchining davomati, haftalik test natijalari va o'zlashtirishi monitoring qilinib, shaxsiy kurator orqali ota-onaga muntazam hisobot berib boriladi.",
    },
  ],
  gallery: [
    {
      id: "g1",
      title: "IT va sun'iy intellekt laboratoriyasi",
      category: "darslar",
      image: "/images/slides/slide_2_it_ai_lab.jpg",
    },
    {
      id: "g2",
      title: "Cambridge uslubidagi til xonasi",
      category: "darslar",
      image: "/images/slides/slide_3_cambridge_room.jpg",
    },
    {
      id: "g3",
      title: "Jonli dars jarayoni",
      category: "darslar",
      image: "/images/slides/slide_5_live_class.jpg",
    },
    {
      id: "g4",
      title: "Boshlang'ich sinf jamoasi",
      category: "darslar",
      image: "/images/slides/slide_4_primary_circle.png",
    },
    {
      id: "g5",
      title: "Algoritm brend taqdimoti",
      category: "tadbirlar",
      image: "/images/slides/slide_1_gold_brand.jpg",
    },
    {
      id: "g6",
      title: "Kampus zali va ochiq muhit",
      category: "sharoitlar",
      image: "/images/slides/slide_6_campus_hall.jpg",
    },
  ],
} satisfies EcosystemContent;
