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
2. Arizalar ikki xil backend'da saqlanishi mumkin (avtomatik tanlanadi):
   - **Upstash Redis (REST)** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` o'rnatilsa. Serverless (Vercel) uchun **majburiy**, chunki u yerda fayl tizimi vaqtinchalik.
   - **JSON fayl** — `LEADS_FILE` yoki `<proyekt>/.data/leads.json` (lokal/VPS uchun; atomik yozish bilan).
3. Agar `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` o'rnatilgan bo'lsa — har bir ariza Telegram'ga bildirishnoma sifatida boradi (yuborish xatosi arizani saqlashni buzmaydi).
4. `/admin` sahifasi arizalarni API orqali ko'radi: qidiruv, status (yangi → bog'lanildi → qabul / bekor), CSV eksport (formula-injection'dan himoyalangan).
5. Server ishlamay qolsa (5xx / tarmoq) forma arizani `localStorage`'ga zaxiralaydi; admin birinchi kirishda ularni avtomatik serverga ko'chiradi. Validatsiya xatolari (4xx) lokalga saqlanmaydi.

### Xavfsizlik

| Himoya | Tafsilot |
|---|---|
| Sessiya | HMAC-SHA256 bilan **imzolangan** token (`exp` + `jti`), 12 soat amal qiladi. Parol hash'i cookie'da saqlanmaydi. |
| Cookie | `HttpOnly`, `SameSite=Strict`, production'da `Secure`. |
| Revoke | `ADMIN_SESSION_SECRET` yoki `ADMIN_PASSWORD` o'zgarsa — barcha sessiyalar bekor bo'ladi. |
| Parol tekshiruvi | Doimiy vaqtda (timing-safe) solishtiriladi. |
| Brute-force | `/api/leads/auth` — 15 daqiqada 8 ta urinish (IP bo'yicha). |
| Spam | `/api/leads` — 1 daqiqada 5 ta, 1 soatda 20 ta + yashirin honeypot maydoni. |
| CSRF | O'zgartiruvchi so'rovlarda `Origin`/`Referer` same-origin bo'lishi shart. |
| Kirish validatsiyasi | Body hajmi ≤ 8 KB, nazorat belgilari tozalanadi, telefon/ism qat'iy tekshiriladi. |
| Sarlavhalar | `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, prod'da HSTS; `/admin` va `/api` — `no-store` + `noindex`. |

> **Muhim:** production'da `ADMIN_PASSWORD` **majburiy**. O'rnatilmasa `/api/leads/auth` `503` qaytaradi va admin paneliga kirib bo'lmaydi (default parol faqat `NODE_ENV=development` da ishlaydi).

## Testlar va CI

```bash
npm test          # vitest (30 ta test: auth, leadStore, rate-limit, API route'lar)
npm run typecheck # tsc --noEmit
npm run lint      # eslint
```

GitHub Actions (`.github/workflows/ci.yml`) har push/PR da lint → typecheck → test → build ni ishga tushiradi.

## Ma'lumotlar manbasi

- `src/data/ecosystemData.ts` — sayt kontentining yagona manbasi (kurslar, FAQ, natijalar, galereya, kontaktlar).
- `data_mastery_algoritm.md` — **haqiqiy arxiv faktlar bazasi** (2022–2026 telegram arxivi asosida). Saytga yangi ma'lumot qo'shishdan oldin shu hujjat bilan solishtiring; telefon raqamlar, ustozlar va statistika **shu manbaga muvofiq** bo'lishi kerak.

## Muhit o'zgaruvchilari (`.env.local`)

```bash
TELEGRAM_BOT_TOKEN=...           # @BotFather orqali olinadi
TELEGRAM_CHAT_ID=...             # xabar boradigan chat/guruh ID si
ADMIN_PASSWORD=...               # /admin paroli — production'da MAJBURIY
ADMIN_SESSION_SECRET=...         # sessiya imzosi (openssl rand -hex 32) — tavsiya etiladi
NEXT_PUBLIC_SITE_URL=...         # https://sizning-domen.uz (SEO metadataBase uchun)

# Saqlash — variant A (serverless/Vercel uchun tavsiya):
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
LEADS_REDIS_KEY=algoritm:leads   # ixtiyoriy

# Saqlash — variant B (lokal/VPS):
LEADS_FILE=...                   # ixtiyoriy — arizalar fayli manzili
```

To'liq ro'yxat va izohlar: [`.env.example`](.env.example).

## Struktura (qisqacha)

```
src/
├── app/                 # sahifalar + API route'lar
│   ├── api/leads/       # arizalar CRUD + auth + logout
│   └── */layout.tsx     # har sahifa uchun SEO metadata
├── components/          # UI komponentlari (client)
├── data/ecosystemData.ts# kontent bazasi
├── lib/                 # leads.ts (tip+klient), leadStore.ts (redis|fayl saqlash),
│                        # adminAuth.ts (HMAC sessiya), rateLimit.ts, telegram.ts
tests/                   # vitest testlari
```

## Eslatmalar

- Rasmlar `public/` da statik. `public/images/media_*.jpg` — kelajakda foydalanish uchun arxiv (saytga hozir ulanmagan).
- Rasmlar `loading="lazy"` / `decoding="async"` bilan yuklanadi; hero rasmi `fetchPriority="high"`. `/images` va `/videos` uchun 1 yillik immutable kesh sarlavhalari o'rnatilgan.
- **Yirik videolar** (`public/videos/aziz_teacher_intro.mp4` ≈ 19 MB) hozircha repo ichida. Modal'da `preload="metadata"` + poster ishlatiladi, ya'ni video faqat ochilganda yuklanadi. Media yanada o'ssa — Vercel Blob / S3 / Cloudflare Stream kabi tashqi xotiraga ko'chirish tavsiya etiladi.
