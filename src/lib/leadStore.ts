// Server-side lead saqlash.
//
// Ikkita backend qo'llab-quvvatlanadi (avtomatik tanlanadi):
//  1. Upstash Redis (REST) — UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN o'rnatilsa.
//     Serverless (Vercel) uchun TAVSIYA ETILADI: fayl tizimi u yerda vaqtinchalik.
//  2. JSON fayl — LEADS_FILE yoki <cwd>/.data/leads.json (lokal/VPS uchun).
//
// Ikkalasi ham bir xil interfeys ortida: listLeads / addLead / updateLead / deleteLead.

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

async function redisRead(): Promise<Lead[]> {
  const raw = await redisCommand<string | null>(["GET", REDIS_KEY]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    return [];
  }
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
  try {
    const raw = await fs.readFile(leadsFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    fileCache = Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    fileCache = [];
  }
  return fileCache;
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

export async function addLead(payload: LeadPayload): Promise<Lead> {
  return enqueueWrite(async () => {
    const leads = await readAll();
    const lead: Lead = {
      ...payload,
      id: newId(),
      createdAt: new Date().toISOString(),
      status: "yangi",
    };
    const next = [lead, ...leads];
    await writeAll(next);
    return lead;
  });
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
}
