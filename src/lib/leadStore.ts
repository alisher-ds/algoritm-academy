// Server-side lead saqlash: fayl (JSON) asosida.
// Fayl manzili: process.env.LEADS_FILE yoki <cwd>/.data/leads.json (gitignore qilingan).
// Bu "demo in-memory" o'rniga oddiy, ishga tushirilganda ham ma'lumotni yo'qotmaydigan yechim.
// Keyinchalik xohlagan ma'lumotlar bazasi (Postgres, SQLite, Turso…) shu funksiyalar ortiga ulanadi.

import { promises as fs } from "fs";
import path from "path";
import type { Lead, LeadPayload, LeadStatus } from "./leads";

const SEED_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Alisher Vohidov",
    phone: "+998 (90) 123-45-67",
    type: "maktab",
    targetInterest: "5-sinf (O'rta ta'lim)",
    preferredTime: "Kunning ikkinchi yarmi",
    notes: "Ingliz tili chuqurlashtirilgan sinfga qiziqyapti",
    source: "seed",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "yangi",
  },
  {
    id: "lead-2",
    name: "Zilola Karimova",
    phone: "+998 (97) 555-88-99",
    type: "kurs",
    targetInterest: "IELTS 7.5+ & CEFR Intensive",
    preferredTime: "Ertalab 09:00",
    notes: "Hozirgi darajasi B2, xorijga grant yutmoqchi",
    source: "seed",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "boglangan",
  },
  {
    id: "lead-3",
    name: "Rustam Ahmedov",
    phone: "+998 (93) 444-11-22",
    type: "kurs",
    targetInterest: "Matematika (Milliy Sertifikat A+ & DTM)",
    preferredTime: "Tushdan keyin",
    notes: "11-sinf abituriyent",
    source: "seed",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "qabul_qilindi",
  },
];

let cache: Lead[] | null = null;
let writeChain: Promise<void> = Promise.resolve();

function leadsFilePath(): string {
  return process.env.LEADS_FILE || path.join(process.cwd(), ".data", "leads.json");
}

async function persist(): Promise<void> {
  const data = cache ?? [];
  const file = leadsFilePath();
  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    });
  await writeChain;
}

async function load(): Promise<Lead[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(leadsFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    cache = SEED_LEADS.map((l) => ({ ...l }));
    await persist();
  }
  return cache;
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await load();
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addLead(payload: LeadPayload): Promise<Lead> {
  const leads = await load();
  const lead: Lead = {
    ...payload,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "yangi",
  };
  leads.unshift(lead);
  cache = leads;
  await persist();
  return lead;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; adminNotes?: string }
): Promise<Lead | null> {
  const leads = await load();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const current = leads[idx];
  const updated: Lead = {
    ...current,
    status: patch.status ?? current.status,
    adminNotes: patch.adminNotes !== undefined ? patch.adminNotes : current.adminNotes,
  };
  leads[idx] = updated;
  cache = leads;
  await persist();
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await load();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  cache = next;
  await persist();
  return true;
}
