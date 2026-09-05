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

function generateIdempotencyKey(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getOutbox(): OutboxItem[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as OutboxItem[]) : [];
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
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
    const items = getOutbox();
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
          item.nextAttemptAt = Date.now() + Math.min(300_000, 10_000 * 2 ** Math.min(item.attempts, 5));
          saveOutbox(getOutbox().map((x) => (x.id === item.id ? item : x)));
        }
      } catch {
        // Hali ham offline
        item.attempts += 1;
        item.nextAttemptAt = Date.now() + 15000;
        saveOutbox(getOutbox().map((x) => (x.id === item.id ? item : x)));
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
    const list: Lead[] = raw ? JSON.parse(raw) : [];
    list.unshift(lead);
    localStorage.setItem(LEADS_LOCAL_KEY, JSON.stringify(list));
  } catch {
    // localStorage mavjud bo'lmasa ham lead obyekti qaytariladi
  }
  return lead;
}

export function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}
