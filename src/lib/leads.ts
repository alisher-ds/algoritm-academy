// Umumiy lead turlari va frontend uchun yordamchi funksiyalar.
// Bu fayl faqat brauzerda ishlaydigan kod uchun xavfsiz (server maxfiy narsalari mavjud emas).

export const LEADS_LOCAL_KEY = "algoritm_crm_leads";

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

/** Arizani backendga yuboradi. Muvaffaqiyatsiz bo'lsa mahalliy (offline) zaxira sifatida localStorage'ga saqlaydi. */
export async function submitLead(
  payload: LeadPayload
): Promise<{ ok: boolean; lead?: Lead; error?: string; storedLocally?: boolean }> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return { ok: true, lead: data.lead };
    }
    const error = data?.error || `Server xatoligi (${res.status})`;
    const lead = saveLeadLocally(payload);
    return { ok: false, error, lead, storedLocally: true };
  } catch {
    const lead = saveLeadLocally(payload);
    return { ok: false, error: "Serverga ulanish imkoni bo'lmadi", lead, storedLocally: true };
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
