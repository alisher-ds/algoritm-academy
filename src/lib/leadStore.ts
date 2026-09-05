// Server-side lead saqlash.
//
// Ikkita backend qo'llab-quvvatlanadi (avtomatik tanlanadi):
//  1. Upstash Redis (REST) — UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN o'rnatilsa.
//     Serverless (Vercel) uchun TAVSIYA ETILADI: fayl tizimi u yerda vaqtinchalik.
//  2. JSON fayl — LEADS_FILE yoki <cwd>/.data/leads.json (lokal/VPS uchun).
//
// Ikkalasi ham bir xil interfeys ortida: listLeads / addLead / updateLead / deleteLead.

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Lead, LeadPayload, LeadStatus } from "./leads";

const REDIS_KEY = process.env.LEADS_REDIS_KEY || "algoritm:leads";

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function storageBackend(): "redis" | "file" {
  return upstashConfig() ? "redis" : "file";
}

/** Serverless muhitda fayl saqlash ma'lumot yo'qolishiga olib keladi — bir marta ogohlantiramiz. */
let warned = false;
function warnEphemeral() {
  if (warned) return;
  warned = true;
  if (storageBackend() === "file" && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    console.warn(
      "[leadStore] DIQQAT: serverless muhitda JSON fayl saqlash vaqtinchalik — arizalar yo'qolishi mumkin. " +
        "UPSTASH_REDIS_REST_URL va UPSTASH_REDIS_REST_TOKEN ni o'rnating."
    );
  }
}

// ─────────────────────────────── Redis (Upstash REST) ───────────────────────────────

async function redisCommand<T>(command: (string | number)[]): Promise<T> {
  const cfg = upstashConfig();
  if (!cfg) throw new Error("Upstash konfiguratsiya qilinmagan");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash xatosi (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { result: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

// Redis Compare-and-Set (CAS) Lua scripti — parallel serverless lambda so'rovlarida arizalarni yo'qotmaslik uchun.
const COMPARE_AND_SET_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if (ARGV[1] == '0' and not current) or (ARGV[1] == '1' and current == ARGV[2]) then
  redis.call('SET', KEYS[1], ARGV[3])
  return 1
end
return 0`;

async function redisReadWithRaw(): Promise<{ raw: string | null; leads: Lead[] }> {
  const raw = await redisCommand<string | null>(["GET", REDIS_KEY]);
  if (!raw) return { raw: null, leads: [] };
  try {
    const parsed = JSON.parse(raw);
    return { raw, leads: Array.isArray(parsed) ? (parsed as Lead[]) : [] };
  } catch {
    return { raw: null, leads: [] };
  }
}

async function redisRead(): Promise<Lead[]> {
  return (await redisReadWithRaw()).leads;
}

async function redisWriteCAS(raw: string | null, leads: Lead[]): Promise<boolean> {
  const res = await redisCommand<number>([
    "EVAL",
    COMPARE_AND_SET_SCRIPT,
    1,
    REDIS_KEY,
    raw === null ? "0" : "1",
    raw ?? "",
    JSON.stringify(leads),
  ]);
  return res === 1;
}

async function redisWrite(leads: Lead[]): Promise<void> {
  await redisCommand(["SET", REDIS_KEY, JSON.stringify(leads)]);
}

// ─────────────────────────────── Fayl backend ───────────────────────────────

let fileCache: Lead[] | null = null;
let writeChain: Promise<void> = Promise.resolve();

function leadsFilePath(): string {
  return process.env.LEADS_FILE || path.join(process.cwd(), ".data", "leads.json");
}

async function filePersist(leads: Lead[]): Promise<void> {
  fileCache = leads;
  const file = leadsFilePath();
  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      // Atomik yozish: avval vaqtinchalik faylga, keyin rename.
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
      await fs.rename(tmp, file);
    });
  await writeChain;
}

async function fileRead(): Promise<Lead[]> {
  if (fileCache) return fileCache;
  const file = leadsFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    fileCache = Array.isArray(parsed) ? (parsed as Lead[]) : [];
    return fileCache;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    // Faqat fayl hali mavjud bo'lmasa bo'sh ro'yxat qaytaramiz (yangi tizim)
    if (code === "ENOENT") {
      fileCache = [];
      return fileCache;
    }
    // Disk, ruxsat (EACCES) yoki fayl tizimi xatosi bo'lsa, xatoni yutib bazani bo'sh deb hisoblash
    // arizalarning yo'qolib ketishiga olib keladi. Shuning uchun xatolik fosh etiladi.
    console.error(`[leadStore] Arizalar faylini o'qishda xatolik yuz berdi (${code}):`, err);
    throw new Error(`Arizalar faylini o'qib bo'lmadi: ${code || "xato"}`);
  }
}

// ─────────────────────────────── Umumiy interfeys ───────────────────────────────

async function readAll(): Promise<Lead[]> {
  warnEphemeral();
  return storageBackend() === "redis" ? redisRead() : fileRead();
}

async function writeAll(leads: Lead[]): Promise<void> {
  if (storageBackend() === "redis") await redisWrite(leads);
  else await filePersist(leads);
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await readAll();
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    writeQueue = writeQueue
      .catch(() => undefined)
      .then(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
  });
}

function newId(): string {
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Receipt = {
  payloadHash: string;
  leadId: string;
  createdAt: string;
  expiresAt: number;
};

const RECEIPT_TTL_MS = 24 * 60 * 60 * 1000; // 24 soat
const receiptStore = new Map<string, Receipt>();

export function payloadIdentity(payload: LeadPayload): string {
  return JSON.stringify({
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    type: payload.type,
    targetInterest: payload.targetInterest.trim(),
    preferredTime: payload.preferredTime?.trim() ?? "",
    notes: payload.notes?.trim() ?? "",
    source: payload.source?.trim() ?? "sayt",
  });
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function createLead(
  payload: LeadPayload,
  idempotencyKey?: string
): Promise<{ lead: Lead; created: boolean }> {
  return enqueueWrite(async () => {
    const leads = await readAll();
    const now = Date.now();

    // 1. Agar Idempotency-Key berilgan bo'lsa, mavjud kvitansiyani tekshiramiz
    if (idempotencyKey) {
      const kHash = hash(idempotencyKey);
      const pHash = hash(payloadIdentity(payload));
      const receipt = receiptStore.get(kHash);
      if (receipt && receipt.expiresAt > now) {
        if (receipt.payloadHash !== pHash) {
          const err = new Error("Bu yuborish kaliti boshqa ariza uchun ishlatilgan. Formani yangilang.");
          (err as unknown as { status: number }).status = 409;
          throw err;
        }
        const existing = leads.find((l) => l.id === receipt.leadId);
        if (existing) {
          return { lead: existing, created: false };
        }
      }
    }

    // 2. Takroriy arizalardan himoya: so'nggi 60 soniya ichida bir xil telefon va yo'nalish
    const recentDuplicate = leads.find((l) => {
      if (l.phone !== payload.phone || l.targetInterest !== payload.targetInterest) return false;
      const age = now - new Date(l.createdAt).getTime();
      return age >= 0 && age < 60_000;
    });
    if (recentDuplicate) {
      return { lead: recentDuplicate, created: false };
    }

    // 3. Yangi ariza yaratish
    const lead: Lead = {
      ...payload,
      id: newId(),
      createdAt: new Date().toISOString(),
      status: "yangi",
    };

    if (storageBackend() === "redis") {
      let saved = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { raw, leads: currentLeads } = await redisReadWithRaw();
        const next = [lead, ...currentLeads];
        const ok = await redisWriteCAS(raw, next);
        if (ok) {
          saved = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
      }
      if (!saved) {
        throw new Error("Redis ma'lumotlar bazasi band. Birozdan so'ng qayta urinib ko'ring.");
      }
    } else {
      const next = [lead, ...leads];
      await writeAll(next);
    }

    // Kvitansiyani saqlash
    if (idempotencyKey) {
      const kHash = hash(idempotencyKey);
      const pHash = hash(payloadIdentity(payload));
      receiptStore.set(kHash, {
        payloadHash: pHash,
        leadId: lead.id,
        createdAt: lead.createdAt,
        expiresAt: now + RECEIPT_TTL_MS,
      });

      // Kvitansiyalar soni ko'payib ketsa, eskirganlarini tozalash
      if (receiptStore.size > 1000) {
        for (const [k, v] of receiptStore.entries()) {
          if (v.expiresAt <= now) receiptStore.delete(k);
        }
      }
    }

    return { lead, created: true };
  });
}

export async function addLead(payload: LeadPayload, idempotencyKey?: string): Promise<Lead> {
  const result = await createLead(payload, idempotencyKey);
  return result.lead;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; adminNotes?: string }
): Promise<Lead | null> {
  return enqueueWrite(async () => {
    const leads = await readAll();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    const current = leads[idx];
    const updated: Lead = {
      ...current,
      status: patch.status ?? current.status,
      adminNotes: patch.adminNotes !== undefined ? patch.adminNotes : current.adminNotes,
    };
    const next = [...leads];
    next[idx] = updated;
    await writeAll(next);
    return updated;
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  return enqueueWrite(async () => {
    const leads = await readAll();
    const next = leads.filter((l) => l.id !== id);
    if (next.length === leads.length) return false;
    await writeAll(next);
    return true;
  });
}

/** Testlar uchun: fayl kesh'ini tozalash. */
export function __resetFileCache() {
  fileCache = null;
  writeQueue = Promise.resolve();
  receiptStore.clear();
}
