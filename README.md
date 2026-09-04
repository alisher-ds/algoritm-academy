# Algoritm Academy — Xususiy Maktab va Akademik Tayyorlov Ekotizimi

Qarshi shahridagi **Algoritm** ta'lim ekotizimining rasmiy veb-sayti:
1-qanot — **Algoritm School** (0–11-sinf xususiy maktabi) va 2-qanot — **Algoritm Academy** o'quv markazi (PMT, Digital SAT, IELTS, Matematika Milliy Sertifikat A+, DTM).

## Texnologiyalar

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict), **Tailwind CSS 3**, `lucide-react` ikonkalari
- `next dev --webpack` / `next build --webpack`

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # kerakli qiymatlarni kiriting
npm run dev                  # http://localhost:3000
```

Boshqa skriptlar:

| Skript | Vazifa |
|---|---|
| `npm run dev` | Dev-server (webpack) |
| `npm run build` | Production build |
| `npm run start` | Production serverni ishga tushirish |
| `npm run lint` | ESLint tekshiruvi |

## Sahifalar

| Route | Mazmuni |
|---|---|
| `/` | Bosh sahifa: maktab + kurslar ekotizimi |
| `/markaz` | O'quv markazi kurslari (PMT, SAT, IELTS, DTM) |
| `/aloqa` | Manzillar, telefonlar, Telegram |
| `/galereya` | Foto lavhalar |
| `/admin` | **CRM** — arizalar boshqaruvi (parol bilan) |
| `/kurslar` | `/markaz` ga qayta yo'naltiradi |
| `/maktab` | `/` ga qayta yo'naltiradi |
| `/api/leads` | Arizalar API si (GET/POST/PATCH/DELETE) |
| `/api/leads/auth`, `/api/leads/logout` | Admin kirish/chiqish |

## Ariza (lead) tizimi qanday ishlaydi

1. Saytdagi har bir forma (`LeadModal`, `LeadBannerSection`) `POST /api/leads` ga yuboradi.
2. Arizalar serverda **JSON faylda** saqlanadi: `<proyekt>/.data/leads.json` (gitignore qilingan, `LEADS_FILE` env orqali boshqa joyga ko'chirsa bo'ladi).
3. Agar `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` o'rnatilgan bo'lsa — har bir ariza Telegram'ga bildirishnoma sifatida boradi.
4. `/admin` sahifasi arizalarni API orqali ko'radi: qidiruv, status (yangi → bog'lanildi → qabul / bekor), CSV eksport.
5. Internet uzilgan holatlarda forma arizani brauzerning `localStorage`'iga zaxiralaydi; admin birinchi kirishda ularni avtomatik serverga ko'chiradi.

> **Muhim:** `/admin` uchun parolni `.env.local` da `ADMIN_PASSWORD` bilan o'rnating.
> Default qiymat faqat mahalliy ishlab chiqish uchun (`algoritm-admin-2026`) — production'da o'zgartirish shart.

## Ma'lumotlar manbasi

- `src/data/ecosystemData.ts` — sayt kontentining yagona manbasi (kurslar, FAQ, natijalar, galereya, kontaktlar).
- `data_mastery_algoritm.md` — **haqiqiy arxiv faktlar bazasi** (2022–2026 telegram arxivi asosida). Saytga yangi ma'lumot qo'shishdan oldin shu hujjat bilan solishtiring; telefon raqamlar, ustozlar va statistika **shu manbaga muvofiq** bo'lishi kerak.

## Muhit o'zgaruvchilari (`.env.local`)

```bash
TELEGRAM_BOT_TOKEN=...        # @BotFather orqali olinadi
TELEGRAM_CHAT_ID=...          # xabar boradigan chat/guruh ID si
ADMIN_PASSWORD=...            # /admin paroli (default faqat dev uchun)
NEXT_PUBLIC_SITE_URL=...      # https://sizning-domen.uz (SEO metadataBase uchun)
LEADS_FILE=...                # ixtiyoriy — arizalar fayli manzili
```

## Struktura (qisqacha)

```
src/
├── app/                 # sahifalar + API route'lar
│   ├── api/leads/       # arizalar CRUD + auth + logout
│   └── */layout.tsx     # har sahifa uchun SEO metadata
├── components/          # UI komponentlari (client)
├── data/ecosystemData.ts# kontent bazasi
└── lib/                 # leads.ts (tip+klient), leadStore.ts (fayl-saqlash),
                         # adminAuth.ts, telegram.ts, utils.ts
```

## Eslatmalar

- Rasmlar `public/` da statik. `public/images/media_*.jpg` — kelajakda foydalanish uchun arxiv (saytga hozir ulanmagan).
- Yirik videolarni (`public/videos/aziz_teacher_intro.mp4`) production'ga chiqarishda CDN/kompressiya qilish tavsiya etiladi.
