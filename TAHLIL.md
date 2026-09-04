# ALGORITM ACADEMY — Loyiha Tahlili va Tuzatishlar Jurnali

> **Boshlang'ich commit:** `df6f03e` · **Sana:** 2026-09-04 · **Tarmoq:** `arena/01a06d8f-algoritm-academy`
> **Yakuniy holat:** `npm run lint` → 0/0 · `tsc` → toza · `npm run build` → ✅ · Lead API e2e → ✅

---

## 1. Loyiha nima

Qarshi shahridagi **Algoritm ta'lim ekotizimi** marketing-sayti: 1-qanot — **Algoritm School** (0–11-sinf xususiy maktabi, bosh sahifa), 2-qanot — **Algoritm Academy** o'quv markazi kurslari (PMT, Digital SAT, IELTS, Matematika A+, DTM).

**Stack:** Next.js 16 (App Router, webpack) · React 19 · TypeScript (strict) · Tailwind 3 · `lucide-react` · ESLint 9.

**Hajm (yakuniy):** `public/` ≈ 28 MB (23 MB video) · 23 komponent · 6 sahifa + 2 redirect + 3 API route.

---

## 2. Topilgan muammolar va yechimlar (jurnali)

### 🔴 P0 — Lead/CRM tizimi uzilgan edi → to'liq tiklandi
**Muammo:** `LeadModal` faqat `localStorage`'ga yozardi; pastki `LeadBannerSection` formasi hech qayerga saqlamasdi; to'liq ishlaydigan `/api/leads` + Telegram frontenddan umuman chaqirilmasdi. `/admin` localStorage o'qiydigan "soxta CRM" edi; status enum'lari 2 xil; saqlash in-memory (restartda yo'qoladi).

**Yechim:**
- `src/lib/leads.ts` — umumiy tiplar + `submitLead()` (serverga POST; tarmoq uzilsa localStorage zaxira).
- `LeadModal` va `LeadBannerSection` endi API'ga yuboradi (offline holatda halol xabar bilan).
- `src/lib/leadStore.ts` — fayl-saqlash (`.data/leads.json`; `LEADS_FILE` env; server restartda saqlanadi).
- `/api/leads` → GET/POST/PATCH/**DELETE** + validatsiya + IP rate-limit; GET/PATCH/DELETE faqat admin.
- `/api/leads/auth` + `/api/leads/logout` — HttpOnly cookie (`ADMIN_PASSWORD` env, default faqat dev).
- `/admin` API'dan o'qiydi; offline arizalarni birinchi kirishda avtomatik ko'chiradi; CSV eksport.
- `telegram.ts` — Markdown-escaping, yagona manbadan TYPE_LABELS; `.env.example` qo'shildi.

### 🟠 P1 — Faktlar bazasi bilan ziddiyatlar → moslashtirildi (`data_mastery_algoritm.md`)
- Maktab: **+998 (99) 141-05-05**, Telegram `@algoritm_xususiy_maktab` (Footer, /aloqa).
- Markaz: +998 (90) 895-05-05 **va** +998 (88) 895-05-05 (94-raqam olib tashlandi).
- Aziz Xolmurodov → **Maktab Matematika Ustozi (Milliy sertifikat A+)**; soxta IELTS/CELTA da'volari olib tashlandi.
- 9 nafar boshqa "ustoz" kartasida boshqa shaxsning videosi "jonli dars" sifatida ko'rsatilardi — to'xtatildi (faqat haqiqiy video bor ustozda video oynasi; qolganlarida profil rasmi).
- Statistika yorliqlari aniqlandi (masalan Hero "250+" → "Matematika Milliy sertifikati (A+)").
- VideoModal'dagi mavjud bo'lmagan Instagram akkaunt default'i olib tashlandi.

### 🟠 P1 — Bosh sahifa FAQ bo'sh edi → tuzatildi
`categoryFilter="umumiy"` berilgan, lekin `faqs`da umumiy kategoriya yo'q edi → 0 savol.
**Yechim:** 12 ta FAQ (7 maktab, 1 markaz, 4 umumiy — arxiv faktlariga asoslangan); FAQAccordion filtri tozalandi; "umumiy" savollar barcha bo'limlarda ko'rinadi.

### 🟠 P2 — O'lik kod va ortiqcha narsalar → o'chirildi
- 3 ishlatilmagan komponent (`WhyAlgoritm`, `EcosystemSplit`, `AudienceResonance`) + 2 stub (`TestimonialSlider`, `SchoolSpotlightBanner`).
- `ECOSYSTEM_DATA.teachers` (1 yozuv, ishlatilmasdi), `COMPARISON_STATS_2025_2026` (14 qator), `Teacher`/`SchoolFeature` interfeyslari.
- `crop_aziz.ps1` (lokal Windows skript), create-next-app qoldiqlari (`next/vercel/file/globe/window.svg`), dublikat rasmlar (`campus_hall.jpg`=slide_6, `media_25.jpg`=media_1), ishlatilmagan `logo-full/logo-emblem.png`, `src/types/lucide-react.d.ts` (stub — keraksiz ekan).

### 🟡 P2 — Galereya va media
- Galereya demo-SVG o'rniga **real fotolar** (`/images/slides/*`) ko'rsatadi; soxta play-tugmasi olib tashlandi; "(Demo)" yorliqlari olib tashlandi.
- 6 ta aynan bir xil reel video (md5 bir xil) → bittasi saqlandi (`public/` 54 → 28 MB).
- Favicon/ikonkalar 620 KB → 32–46 KB (ImageMagick): `src/app/icon.png` (192px), `favicon.ico`, `apple-icon.png`.
- ⚠ Tafsiya: `public/images/media_*.jpg` (28 dona) arxiv — vizual tekshirib galereyaga qo'shish mumkin; `aziz_teacher_intro.mp4` (18.9 MB) kompressiya/CDN talab qiladi (bu muhitda ffmpeg yo'q).

### 🟡 P2 — SEO
- Root `metadataBase` (`NEXT_PUBLIC_SITE_URL`), har sahifaga alohida `layout.tsx` metadata: `/markaz`, `/aloqa`, `/galereya`, `/admin` (`noindex`).

### 🟡 P2 — Lint/kod sifati
- **198 muammo (118 xato) → 0/0.** Asosli istisnolar (eslint.config.mjs da izoh bilan): `react/no-unescaped-entities` (o'zbek apostroflari), `@next/next/no-img-element` (statik marketing rasmlari).
- Barcha unused import/state/proplar tozalandi; `a && b()` → `if`; `catch (e)` → `catch {}`; VideoModal'da `instagramUrl` endi ishlatiladi (Instagram havolasi).

### 🟡 P2 — Hujjatlar
- `README.md` to'liq qayta yozildi; `.env.example`; `.gitignore` da `.data/`.

---

## 3. Sinov natijalari

| Tekshiruv | Natija |
|---|---|
| `npm run lint` | ✅ 0 muammo |
| `npx tsc --noEmit` | ✅ toza |
| `npm run build` | ✅ 13 route (statik + `/api/leads*` dynamic) |
| Sahifalar (dev) | `/`, `/markaz`, `/aloqa`, `/galereya`, `/admin` → 200; `/kurslar`, `/maktab` → 307 |
| API e2e | 401 (auth yo'q) → login 200 → GET 3 lead → POST 201 → PATCH → DELETE 200 → logout → 401 ✅ |
| FAQ (bosh sahifa) | 12 savol SSR HTMLda ✅ |
| /aloqa | 141-05-05 va 88-895-05-05 ko'rinadi ✅ |

## 4. Yakuniy ko'rsatkichlar

| Ko'rsatkich | Oldin | Keyin |
|---|---|---|
| Lint | 198 (118 xato) | 0/0 |
| `public/` | ~54 MB (47 MB video) | ~28 MB (23 MB video) |
| Komponentlar | 28 | 23 |
| FAQ savollari | 4 (bosh sahifada 0) | 12 (hammasi ko'rinadi) |
| API | 3 method, in-memory, frontend ulanmagan | CRUD + auth + logout, fayl-saqlash, frontend ulangan |
