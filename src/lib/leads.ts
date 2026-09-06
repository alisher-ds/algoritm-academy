import { normalizeUzPhone } from "./phone";

export const LEADS_LOCAL_KEY = "algoritm_crm_leads";
export const OUTBOX_KEY = "algoritm_lead_outbox";

export type LeadType = "maktab" | "kurs" | "umumiy";

export type LeadStatus =
  | "yangi"
  | "boglangan"
  | "qabul_qilindi"
  | "bekor_qilindi";

export interface LeadPayload {
  name: string;
  phone: string;
  type: LeadType;
  targetInterest: string;
  preferredTime?: string;
  notes?: string;
  source?: string;
}

export interface Lead extends LeadPayload {
  id: string;
  createdAt: string;
  status: LeadStatus;
  adminNotes?: string;
}

export interface OutboxItem {
  id: string; // Idempotency-Key
  payload: LeadPayload & { website?: string };
  createdAt: string;
  attempts: number;
  nextAttemptAt: number;
  state: "pending" | "failed";
  lastError?: string;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  yangi: "Yangi",
  boglangan: "Bog'lanildi",
  qabul_qilindi: "Qabul qilindi",
  bekor_qilindi: "Bekor qilindi",
};

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "yangi", label: "Yangi" },
  { value: "boglangan", label: "Bog'lanildi" },
  { value: "qabul_qilindi", label: "Qabul qilindi" },
  { value: "bekor_qilindi", label: "Bekor qilindi" },
];

export interface LeadOption {
  value: string;
  type: LeadType;
  label: string;
}

export const LEAD_OPTIONS: LeadOption[] = [
  // Maktab
  { value: "0–11 Sinf Xususiy Maktabi", type: "maktab", label: "0–11 Sinf Xususiy Maktabi" },
  { value: "Maktabgacha tayyorlov", type: "maktab", label: "Maktabgacha tayyorlov" },

  // O'quv markazi — Flagman kurslar
  { value: "Prezident maktabiga tayyorlov", type: "kurs", label: "Prezident maktabiga tayyorlov" },
  { value: "Digital SAT", type: "kurs", label: "Digital SAT" },
  { value: "IELTS 7+", type: "kurs", label: "IELTS 7+" },
  { value: "Matematika", type: "kurs", label: "Matematika" },

  // O'quv markazi — Fanlar
  { value: "Fizika", type: "kurs", label: "Fizika" },
  { value: "Kimyo", type: "kurs", label: "Kimyo" },
  { value: "Biologiya", type: "kurs", label: "Biologiya" },
  { value: "Ingliz tili 0 dan", type: "kurs", label: "Ingliz tili 0 dan" },
  { value: "Ona tili", type: "kurs", label: "Ona tili" },
  { value: "Huquq", type: "kurs", label: "Huquq" },
  { value: "Tarix", type: "kurs", label: "Tarix" },

  // Umumiy
  { value: "Boshqa yo'nalish / Maslahat olish", type: "umumiy", label: "Boshqa yo'nalish / Maslahat olish" },
];

function generateIdempotencyKey(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Navbatdagi ariza shuncha urinishdan keyin tashlab yuboriladi. */
const OUTBOX_MAX_ATTEMPTS = 10;
/** Shu muddatdan eski ariza yuborilmaydi — u allaqachon ma'nosiz. */
const OUTBOX_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Muddati o'tgan yoki urinishlari tugagan yozuvlarni chiqarib tashlaydi.
 *
 * Ilgari bunday tozalash umuman yo'q edi: server uzoq ishlamay qolsa yozuvlar
 * foydalanuvchi brauzerida abadiy qolib, har sahifa ochilishida qayta urinardi.
 */
function prune(items: OutboxItem[]): { keep: OutboxItem[]; dropped: number } {
  const now = Date.now();
  const keep = items.filter((it) => {
    if (it.attempts >= OUTBOX_MAX_ATTEMPTS) return false;
    const age = now - new Date(it.createdAt).getTime();
    return !(Number.isFinite(age) && age > OUTBOX_MAX_AGE_MS);
  });
  return { keep, dropped: items.length - keep.length };
}

/**
 * LocalStorage ma'lumotlarini ochiq matn (plaintext) ko'rinishida saqlamaslik
 * uchun shifrlash / de-shifrlash yordamchisi (XOR + Base64 + Magic Header).
 * Bu brauzer DevTools yoki skriptlar orqali telefon raqamlar va ismlarni ochiq ko'rishdan himoya qiladi.
 */
const STORAGE_PREFIX = "enc:v1:";

export function encryptStorage(data: unknown): string {
  try {
    const raw = JSON.stringify(data);
    const code = 0x5a;
    const utf8 = encodeURIComponent(raw);
    let out = "";
    for (let i = 0; i < utf8.length; i++) {
      out += String.fromCharCode(utf8.charCodeAt(i) ^ code);
    }
    const b64 =
      typeof window !== "undefined" && typeof window.btoa === "function"
        ? window.btoa(out)
        : Buffer.from(out, "binary").toString("base64");
    return STORAGE_PREFIX + b64;
  } catch {
    return JSON.stringify(data);
  }
}

export function decryptStorage<T>(cipher: string | null): T | null {
  if (!cipher) return null;
  try {
    if (!cipher.startsWith(STORAGE_PREFIX)) {
      // Eski (shifrlanmagan) ma'lumotlar bilan orqaga moslik (backward compatibility)
      return JSON.parse(cipher) as T;
    }
    const b64 = cipher.slice(STORAGE_PREFIX.length);
    const raw =
      typeof window !== "undefined" && typeof window.atob === "function"
        ? window.atob(b64)
        : Buffer.from(b64, "base64").toString("binary");
    const code = 0x5a;
    let utf8 = "";
    for (let i = 0; i < raw.length; i++) {
      utf8 += String.fromCharCode(raw.charCodeAt(i) ^ code);
    }
    return JSON.parse(decodeURIComponent(utf8)) as T;
  } catch {
    return null;
  }
}

export function getOutbox(): OutboxItem[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return decryptStorage<OutboxItem[]>(raw) ?? [];
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(OUTBOX_KEY, encryptStorage(items));
  } catch {
    // localStorage to'lgan yoki bloklangan
  }
}

export function addToOutbox(id: string, payload: LeadPayload & { website?: string }, error?: string): OutboxItem {
  const items = getOutbox();
  const existing = items.find((it) => it.id === id);
  if (existing) return existing;

  const item: OutboxItem = {
    id,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 1,
    nextAttemptAt: Date.now() + 15000,
    state: "pending",
    lastError: error,
  };
  items.push(item);
  saveOutbox(items);
  return item;
}

export function removeFromOutbox(id: string): void {
  const items = getOutbox().filter((it) => it.id !== id);
  saveOutbox(items);
}

/** Arizani backendga yuboradi. Muvaffaqiyatsiz bo'lsa mahalliy (offline) zaxira sifatida localStorage'ga saqlaydi. */
export async function submitLead(
  payload: LeadPayload & { website?: string },
  customIdempotencyKey?: string
): Promise<{ ok: boolean; lead?: Lead; error?: string; storedLocally?: boolean; idempotencyKey?: string }> {
  const idempotencyKey = customIdempotencyKey || generateIdempotencyKey();
  const normalizedPhone = normalizeUzPhone(payload.phone);
  const cleanPayload: LeadPayload & { website?: string } = {
    ...payload,
    phone: normalizedPhone || payload.phone,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(cleanPayload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      removeFromOutbox(idempotencyKey);
      return { ok: true, lead: data.lead, idempotencyKey };
    }

    const error = data?.error || `Server xatoligi (${res.status})`;

    // 4xx — mijoz xatosi (masalan, noto'g'ri ism/telefon): offline navbatga qo'shilmaydi.
    if (res.status >= 400 && res.status < 500 && res.status !== 429) {
      return { ok: false, error, idempotencyKey };
    }

    // Server xatosi yoki 429: navbatga saqlanadi
    addToOutbox(idempotencyKey, cleanPayload, error);
    const lead = saveLeadLocally(cleanPayload);
    return { ok: false, error, lead, storedLocally: true, idempotencyKey };
  } catch {
    // Tarmoq uzilishi (offline)
    addToOutbox(idempotencyKey, cleanPayload, "Internet aloqasi yo'q");
    const lead = saveLeadLocally(cleanPayload);
    return {
      ok: false,
      error: "Serverga ulanish imkoni bo'lmadi — arizangiz qurilmada saqlandi va internet paydo bo'lganda avtomatik yuboriladi.",
      lead,
      storedLocally: true,
      idempotencyKey,
    };
  }
}

let isFlushing = false;

/** Offline arizalarni avtomatik tarzda serverga jo'natish (tarmoq qayta ulanganda ishga tushadi). */
export async function flushOutbox(): Promise<{ sent: number; remaining: number }> {
  if (isFlushing || typeof window === "undefined") return { sent: 0, remaining: 0 };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { sent: 0, remaining: getOutbox().length };
  }

  isFlushing = true;
  let sent = 0;

  try {
    // Avval eskirgan yozuvlarni tashlaymiz.
    const { keep, dropped } = prune(getOutbox());
    if (dropped > 0) saveOutbox(keep);
    const items = keep;
    const now = Date.now();

    for (const item of items) {
      if (item.nextAttemptAt > now) continue;

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": item.id,
          },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          removeFromOutbox(item.id);
          sent++;
        } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          // Qaytarib bo'lmaydigan klient xatosi
          removeFromOutbox(item.id);
        } else {
          // 5xx yoki 429: urinishlar sonini oshirib keyinga qoldirish
          item.attempts += 1;
          if (item.attempts >= OUTBOX_MAX_ATTEMPTS) {
            item.state = "failed";
            removeFromOutbox(item.id);
          } else {
            item.nextAttemptAt =
              Date.now() + Math.min(300_000, 10_000 * 2 ** Math.min(item.attempts, 5));
            saveOutbox(getOutbox().map((x) => (x.id === item.id ? item : x)));
          }
        }
      } catch {
        // Hali ham offline
        item.attempts += 1;
        if (item.attempts >= OUTBOX_MAX_ATTEMPTS) {
          removeFromOutbox(item.id);
        } else {
          item.nextAttemptAt = Date.now() + 15000;
          saveOutbox(getOutbox().map((x) => (x.id === item.id ? item : x)));
        }
        break; // keyingi so'rovlarni urinmay to'xtatish
      }
    }
  } finally {
    isFlushing = false;
  }

  return { sent, remaining: getOutbox().length };
}

// Brauzer hodisalari bilan avtomatik sinxronizatsiya
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushOutbox().catch(() => {});
  });
  if (typeof navigator !== "undefined" && navigator.onLine) {
    setTimeout(() => {
      flushOutbox().catch(() => {});
    }, 2000);
  }
}

export function saveLeadLocally(payload: LeadPayload): Lead {
  const lead: Lead = {
    ...payload,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "yangi",
  };
  try {
    const raw = localStorage.getItem(LEADS_LOCAL_KEY);
    const list: Lead[] = decryptStorage<Lead[]>(raw) ?? [];
    list.unshift(lead);
    localStorage.setItem(LEADS_LOCAL_KEY, encryptStorage(list));
  } catch {
    // localStorage mavjud bo'lmasa ham lead obyekti qaytariladi
  }
  return lead;
}

export function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_LOCAL_KEY);
    return decryptStorage<Lead[]>(raw) ?? [];
  } catch {
    return [];
  }
}
