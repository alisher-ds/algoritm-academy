# Algoritm Academy & School

Qarshi shahridagi **Algoritm** ta'lim ekotizimining rasmiy veb-platformasi:
- **Algoritm Xususiy Maktabi** (0–11 sinflar)
- **Algoritm O'quv Markazi** (PMT, Digital SAT, IELTS, Milliy sertifikat, DTM)
- **CRM va Davomat tizimi** (Admin boshqaruv paneli va ustozlar portali)

---

## Asosiy imkoniyatlar

- **Rasmiy veb-sayt:** Maktab va markaz yo'nalishlari, kurslar katalogi, natijalar, galereya va filial manzillari.
- **Onlayn qabul (CRM):** Sayt orqali kelib tushgan arizalar avtomatik tarzda Telegram botga/guruhga yetkaziladi va admin panelda boshqariladi.
- **Davomat va guruhlar:** Ustozlar uchun shaxsiy kabinet, dars jadvallari, davomat belgilash va oylik hisob-kitob tizimi.
- **Mobil moslashuvchanlik:** Barcha smartfonlar, kompyuterlar va Telegram Mini App uchun qulay dizayn.

---

## Ishga tushirish

1. Loyiha bog'liqliklarini o'rnatish:
   ```bash
   npm install
   ```

2. Muhit parametrlarini sozlash:
   ```bash
   cp .env.example .env.local
   ```
   *(Kerakli `ADMIN_PASSWORD`, `DATABASE_URL` yoki Telegram bot parametrlarini kiriting)*

3. Loyihani ishga tushirish:
   ```bash
   npm run dev
   ```
   Brauzerda ochish: `http://localhost:3000`

---

## Asosiy sahifalar

- `/` — Bosh sahifa (Ekotizim taqdimoti)
- `/maktab` — Xususiy maktab sahifasi
- `/markaz` — O'quv markazi va natijalar
- `/kurslar` — Barcha kurslar katalogi
- `/aloqa` — Manzillar va bog'lanish
- `/admin` — Boshqaruv (CRM) paneli
- `/davomat` — Ustozlar davomat portali

---

## Asosiy buyruqlar

- `npm run dev` — Dasturchi rejimida ishga tushirish
- `npm run build` — Production uchun loyihani yig'ish
- `npm run start` — Tayyor loyihani ishga tushirish
- `npm test` — Testlarni tekshirish
- `npm run lint` — Kod sifatini tekshirish
