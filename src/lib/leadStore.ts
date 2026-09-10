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
import os from "os";
import path from "path";
import type { Lead, LeadPayload, LeadStatus, LeadType } from "./leads";
import { isDbConnected, query, initDatabase, withTransaction } from "./db";

const REDIS_KEY = process.env.LEADS_REDIS_KEY || "algoritm:leads";

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function storageBackend(): "postgres" | "redis" | "file" {
  if (isDbConnected()) return "postgres";
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
        "DATABASE_URL (Supabase/Neon) yoki UPSTASH_REDIS_REST_URL ni o'rnating."
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
    // Corrupt Redis JSON must fail closed; treating it as an empty CRM would
    // overwrite the real data on the next write.
    throw new Error("Redis arizalar ma'lumotlari buzilgan");
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
  if (process.env.LEADS_FILE) return process.env.LEADS_FILE;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "leads.json");
  }
  return path.join(process.cwd(), ".data", "leads.json");
}

async function filePersist(leads: Lead[]): Promise<void> {
  const file = leadsFilePath();
  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(file), { recursive: true });
        // Atomik yozish: avval vaqtinchalik faylga, keyin rename.
        const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
        await fs.rename(tmp, file);
      } catch (err) {
        // Faqat xotirada saqlab, HTTP 201 qaytarish ma'lumot yo'qolishiga olib
        // keladi. Fayl backend tanlangan bo'lsa, bu haqiqiy saqlash xatosidir.
        console.error("[leadStore] Fayl tizimiga yozib bo'lmadi:", err);
        throw new Error("Arizani doimiy saqlab bo'lmadi");
      }
      fileCache = leads;
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

// ─────────────────────────────── PostgreSQL Backend ───────────────────────────────

interface DbLeadRow {
  id: string;
  name: string;
  phone: string;
  type: LeadType;
  target_interest: string;
  preferred_time?: string | null;
  notes?: string | null;
  source?: string | null;
  status: LeadStatus;
  admin_notes?: string | null;
  created_at: Date | string;
}

function mapDbLead(r: DbLeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    type: r.type,
    targetInterest: r.target_interest,
    preferredTime: r.preferred_time || undefined,
    notes: r.notes || undefined,
    source: r.source || undefined,
    status: r.status,
    adminNotes: r.admin_notes || undefined,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

async function postgresRead(): Promise<Lead[]> {
  await initDatabase();
  const rows = await query<DbLeadRow>("SELECT * FROM leads ORDER BY created_at DESC");
  return rows.map(mapDbLead);
}

async function postgresWrite(leads: Lead[]): Promise<void> {
  await initDatabase();
  for (const l of leads) {
    await query(
      `INSERT INTO leads (id, name, phone, type, target_interest, preferred_time, notes, source, status, admin_notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         type = EXCLUDED.type,
         target_interest = EXCLUDED.target_interest,
         preferred_time = EXCLUDED.preferred_time,
         notes = EXCLUDED.notes,
         source = EXCLUDED.source,
         status = EXCLUDED.status,
         admin_notes = EXCLUDED.admin_notes`,
      [
        l.id,
        l.name,
        l.phone,
        l.type,
        l.targetInterest,
        l.preferredTime || null,
        l.notes || null,
        l.source || null,
        l.status,
        l.adminNotes || null,
        l.createdAt,
      ]
    );
  }
}

async function postgresDelete(ids: string[]): Promise<number> {
  await initDatabase();
  if (ids.length === 0) return 0;
  const res = await query<{ count: string }>(
    "WITH del AS (DELETE FROM leads WHERE id = ANY($1) RETURNING *) SELECT count(*) FROM del",
    [ids]
  );
  return Number(res[0]?.count || 0);
}

// ─────────────────────────────── Umumiy interfeys ───────────────────────────────

async function readAll(): Promise<Lead[]> {
  if (storageBackend() === "postgres") return postgresRead();
  warnEphemeral();
  return storageBackend() === "redis" ? redisRead() : fileRead();
}

async function writeAll(leads: Lead[]): Promise<void> {
  if (storageBackend() === "postgres") await postgresWrite(leads);
  else if (storageBackend() === "redis") await redisWrite(leads);
  else await filePersist(leads);
}

/**
 * Redis yoki PostgreSQL rejimida o'qish→o'zgartirish→yozish siklini bajaradi.
 */
async function mutate<T>(
  apply: (leads: Lead[]) => { next: Lead[]; result: T } | { next: null; result: T }
): Promise<T> {
  if (storageBackend() === "postgres") {
    const leads = await postgresRead();
    const { next, result } = apply(leads);
    if (next) await postgresWrite(next);
    return result;
  }
  if (storageBackend() !== "redis") {
    const leads = await readAll();
    const { next, result } = apply(leads);
    if (next) await writeAll(next);
    return result;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const { raw, leads } = await redisReadWithRaw();
    const { next, result } = apply(leads);
    if (!next) return result; // o'zgartirish kerak emas (masalan, topilmadi)
    if (await redisWriteCAS(raw, next)) return result;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
  }
  throw new Error("Redis ma'lumotlar bazasi band. Birozdan so'ng qayta urinib ko'ring.");
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await readAll();
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export interface LeadStatsSummary {
  total: number;
  yangi: number;
  boglangan: number;
  qabul_qilindi: number;
  bekor_qilindi: number;
  todayCount: number;
}

export interface LeadQueryFilter {
  search?: string;
  status?: LeadStatus | "hammasi";
  type?: LeadType | "hammasi";
  dateRange?: "bugun" | "hafta" | "oy" | "hammasi";
}

export interface LeadPage {
  leads: Lead[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  stats?: LeadStatsSummary;
}

/**
 * Arizalarni sahifa bo'yicha qaytaradi (qidiruv, status, tur va sana filtrlari hamda umumiy statistika bilan).
 */
export async function listLeadsPage(
  offset = 0,
  limit = 100,
  filters?: LeadQueryFilter
): Promise<LeadPage> {
  const rawAll = await listLeads();

  // Baza bo'yicha umumiy KPI statistikasini hisoblash
  const now = Date.now();
  const todayStr = new Date(now).toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" });
  const stats: LeadStatsSummary = {
    total: rawAll.length,
    yangi: 0,
    boglangan: 0,
    qabul_qilindi: 0,
    bekor_qilindi: 0,
    todayCount: 0,
  };

  for (const l of rawAll) {
    if (l.status === "yangi") stats.yangi++;
    else if (l.status === "boglangan") stats.boglangan++;
    else if (l.status === "qabul_qilindi") stats.qabul_qilindi++;
    else if (l.status === "bekor_qilindi") stats.bekor_qilindi++;

    const itemDate = new Date(l.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" });
    if (itemDate === todayStr) {
      stats.todayCount++;
    }
  }

  let all = rawAll;

  if (filters) {
    if (filters.status && filters.status !== "hammasi") {
      all = all.filter((l) => l.status === filters.status);
    }
    if (filters.type && filters.type !== "hammasi") {
      all = all.filter((l) => l.type === filters.type);
    }
    if (filters.dateRange && filters.dateRange !== "hammasi") {
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (filters.dateRange === "bugun") {
        all = all.filter((l) => {
          const itemDate = new Date(l.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" });
          return itemDate === todayStr;
        });
      } else if (filters.dateRange === "hafta") {
        const weekAgo = now - 7 * oneDayMs;
        all = all.filter((l) => new Date(l.createdAt).getTime() >= weekAgo);
      } else if (filters.dateRange === "oy") {
        const monthAgo = now - 30 * oneDayMs;
        all = all.filter((l) => new Date(l.createdAt).getTime() >= monthAgo);
      }
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const digits = filters.search.replace(/\D/g, "");
      all = all.filter((l) => {
        const matchPhone = digits.length > 0 && l.phone.replace(/\D/g, "").includes(digits);
        return (
          l.name.toLowerCase().includes(q) ||
          matchPhone ||
          l.targetInterest.toLowerCase().includes(q) ||
          (l.notes ? l.notes.toLowerCase().includes(q) : false) ||
          (l.adminNotes ? l.adminNotes.toLowerCase().includes(q) : false)
        );
      });
    }
  }

  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 500);
  const slice = all.slice(safeOffset, safeOffset + safeLimit);
  return {
    leads: slice,
    total: all.length,
    offset: safeOffset,
    limit: safeLimit,
    hasMore: safeOffset + slice.length < all.length,
    stats,
  };
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

// Fayl (bir jarayonli) rejim uchun xotiradagi kvitansiyalar.
const receiptStore = new Map<string, Receipt>();

/**
 * Idempotency kvitansiyasini o'qish.
 *
 * Redis rejimida u Redis'da saqlanadi: serverless'da har so'rov boshqa instansiyaga
 * tushishi mumkin, sovuq start esa xotirani tozalaydi — shu sabab xotiradagi Map
 * u yerda ishlamaydi va dublikat arizalar paydo bo'lardi.
 */
async function readReceipt(kHash: string): Promise<Receipt | null> {
  if (storageBackend() === "postgres") {
    try {
      await initDatabase();
      const rows = await query<{
        payload_hash: string;
        lead_id: string;
        created_at: Date | string;
        expires_at: string | number;
      }>("SELECT * FROM idempotency_receipts WHERE key_hash = $1", [kHash]);
      if (rows.length === 0) return null;
      const r = rows[0];
      if (Number(r.expires_at) <= Date.now()) {
        await query("DELETE FROM idempotency_receipts WHERE key_hash = $1", [kHash]).catch(() => {});
        return null;
      }
      return {
        payloadHash: r.payload_hash,
        leadId: r.lead_id,
        createdAt: new Date(r.created_at).toISOString(),
        expiresAt: Number(r.expires_at),
      };
    } catch (err) {
      console.error("[leadStore] PostgreSQL kvitansiyani o'qib bo'lmadi:", err);
      return null;
    }
  }
  if (storageBackend() !== "redis") {
    return receiptStore.get(kHash) ?? null;
  }
  try {
    const raw = await redisCommand<string | null>(["GET", `${REDIS_KEY}:rcpt:${kHash}`]);
    return raw ? (JSON.parse(raw) as Receipt) : null;
  } catch (err) {
    // Idempotency tekshiruvi ishlamasa, yangi dublikat ariza yaratishdan ko'ra
    // so'rovni vaqtincha rad etish xavfsizroq.
    console.error("[leadStore] Kvitansiyani o'qib bo'lmadi:", err);
    throw new Error("Ariza takrorlanishini tekshirib bo'lmadi");
  }
}

async function writeReceipt(kHash: string, receipt: Receipt): Promise<void> {
  if (storageBackend() === "postgres") {
    try {
      await initDatabase();
      await query(
        `INSERT INTO idempotency_receipts (key_hash, payload_hash, lead_id, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (key_hash) DO UPDATE SET
           payload_hash = EXCLUDED.payload_hash,
           lead_id = EXCLUDED.lead_id,
           expires_at = EXCLUDED.expires_at`,
        [kHash, receipt.payloadHash, receipt.leadId, receipt.createdAt, receipt.expiresAt]
      );
    } catch (err) {
      console.error("[leadStore] PostgreSQL kvitansiyani saqlab bo'lmadi:", err);
      throw new Error("Ariza takrorlanish kvitansiyasini saqlab bo'lmadi");
    }
    return;
  }
  if (storageBackend() !== "redis") {
    receiptStore.set(kHash, receipt);
    // Xotira cheksiz o'smasligi uchun eskirganlarini tozalaymiz.
    if (receiptStore.size > 1000) {
      const now = Date.now();
      for (const [k, v] of receiptStore.entries()) {
        if (v.expiresAt <= now) receiptStore.delete(k);
      }
      // Hammasi hali amalda bo'lsa ham chegarani ushlab turamiz (eng eskisidan boshlab).
      if (receiptStore.size > 1000) {
        const sorted = [...receiptStore.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
        for (const [k] of sorted.slice(0, receiptStore.size - 1000)) receiptStore.delete(k);
      }
    }
    return;
  }
  try {
    // TTL Redis tomonidan boshqariladi — qo'lda tozalash kerak emas.
    await redisCommand([
      "SET",
      `${REDIS_KEY}:rcpt:${kHash}`,
      JSON.stringify(receipt),
      "EX",
      String(Math.ceil(RECEIPT_TTL_MS / 1000)),
    ]);
  } catch (err) {
    console.error("[leadStore] Kvitansiyani saqlab bo'lmadi:", err);
    throw new Error("Ariza takrorlanish kvitansiyasini saqlab bo'lmadi");
  }
}

async function reserveRedisReceipt(keyHash: string, receipt: Receipt): Promise<boolean> {
  // Bu faqat qisqa muddatli in-flight lock. Durable idempotency receipt
  // lead muvaffaqiyatli yozilgandan keyin alohida saqlanadi; aks holda process
  // crash bo'lsa kalit 24 soatga "osilib" qolishi mumkin edi.
  const result = await redisCommand<string>([
    "SET",
    `${REDIS_KEY}:lock:${keyHash}`,
    JSON.stringify(receipt),
    "NX",
    "EX",
    "60",
  ]);
  return result === "OK";
}

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

async function postgresCreateLead(
  payload: LeadPayload,
  idempotencyKey?: string
): Promise<{ lead: Lead; created: boolean }> {
  await initDatabase();
  return withTransaction(async (client) => {
    const now = Date.now();
    const keyHash = idempotencyKey ? hash(idempotencyKey) : null;
    const payloadHash = idempotencyKey ? hash(payloadIdentity(payload)) : null;

    if (keyHash && payloadHash) {
      const receiptResult = await client.query<{
        payload_hash: string;
        lead_id: string;
        expires_at: string | number;
      }>("SELECT payload_hash, lead_id, expires_at FROM idempotency_receipts WHERE key_hash = $1 FOR UPDATE", [keyHash]);
      const receipt = receiptResult.rows[0];
      if (receipt && Number(receipt.expires_at) > now) {
        if (receipt.payload_hash !== payloadHash) {
          const error = new Error("Bu yuborish kaliti boshqa ariza uchun ishlatilgan. Formani yangilang.");
          (error as unknown as { status: number }).status = 409;
          throw error;
        }
        const existingResult = await client.query<DbLeadRow>("SELECT * FROM leads WHERE id = $1", [receipt.lead_id]);
        if (existingResult.rows[0]) {
          return { lead: mapDbLead(existingResult.rows[0]), created: false };
        }
      } else if (receipt) {
        await client.query("DELETE FROM idempotency_receipts WHERE key_hash = $1", [keyHash]);
      }
    }

    const duplicateResult = await client.query<DbLeadRow>(
      `SELECT * FROM leads
       WHERE phone = $1 AND target_interest = $2
         AND created_at >= NOW() - INTERVAL '60 seconds'
       ORDER BY created_at DESC LIMIT 1`,
      [payload.phone, payload.targetInterest]
    );
    if (duplicateResult.rows[0]) {
      return { lead: mapDbLead(duplicateResult.rows[0]), created: false };
    }

    const lead: Lead = {
      ...payload,
      id: newId(),
      createdAt: new Date(now).toISOString(),
      status: "yangi",
    };
    await client.query(
      `INSERT INTO leads (id, name, phone, type, target_interest, preferred_time, notes, source, status, admin_notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        lead.id,
        lead.name,
        lead.phone,
        lead.type,
        lead.targetInterest,
        lead.preferredTime || null,
        lead.notes || null,
        lead.source || null,
        lead.status,
        lead.adminNotes || null,
        lead.createdAt,
      ]
    );

    if (keyHash && payloadHash) {
      await client.query(
        `INSERT INTO idempotency_receipts (key_hash, payload_hash, lead_id, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [keyHash, payloadHash, lead.id, lead.createdAt, now + RECEIPT_TTL_MS]
      );
    }
    return { lead, created: true };
  });
}

export async function createLead(
  payload: LeadPayload,
  idempotencyKey?: string
): Promise<{ lead: Lead; created: boolean }> {
  return enqueueWrite(async () => {
    if (storageBackend() === "postgres") {
      return postgresCreateLead(payload, idempotencyKey);
    }

    const leads = await readAll();
    const now = Date.now();

    // 1. Agar Idempotency-Key berilgan bo'lsa, mavjud kvitansiyani tekshiramiz
    if (idempotencyKey) {
      const kHash = hash(idempotencyKey);
      const pHash = hash(payloadIdentity(payload));
      const receipt = (await readReceipt(kHash)) ?? undefined;
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

    let redisReceiptStored = false;
    let redisReceiptKeyHash: string | null = null;
    if (storageBackend() === "redis") {
      if (idempotencyKey) {
        const kHash = hash(idempotencyKey);
        redisReceiptKeyHash = kHash;
        const pHash = hash(payloadIdentity(payload));
        const receipt: Receipt = {
          payloadHash: pHash,
          leadId: lead.id,
          createdAt: lead.createdAt,
          expiresAt: now + RECEIPT_TTL_MS,
        };
        redisReceiptStored = await reserveRedisReceipt(kHash, receipt);
        if (!redisReceiptStored) {
          const currentReceipt = await readReceipt(kHash);
          if (currentReceipt?.payloadHash === pHash) {
            const currentLeads = await redisRead();
            const existing = currentLeads.find((item) => item.id === currentReceipt.leadId);
            if (existing) return { lead: existing, created: false };
          }
          throw new Error("Ariza yuborilishi allaqachon qayta ishlanmoqda. Birozdan so'ng urinib ko'ring.");
        }
      }

      let saved = false;
      try {
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
      } catch (error) {
        if (redisReceiptStored && redisReceiptKeyHash) {
          await redisCommand(["DEL", `${REDIS_KEY}:lock:${redisReceiptKeyHash}`]).catch(() => {});
        }
        throw error;
      }
      if (!saved) {
        if (redisReceiptStored && redisReceiptKeyHash) {
          await redisCommand(["DEL", `${REDIS_KEY}:lock:${redisReceiptKeyHash}`]).catch(() => {});
        }
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
      await writeReceipt(kHash, {
        payloadHash: pHash,
        leadId: lead.id,
        createdAt: lead.createdAt,
        expiresAt: now + RECEIPT_TTL_MS,
      });
      if (redisReceiptStored && redisReceiptKeyHash) {
        await redisCommand(["DEL", `${REDIS_KEY}:lock:${redisReceiptKeyHash}`]).catch(() => {});
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
  return enqueueWrite(() =>
    mutate<Lead | null>((leads) => {
      const idx = leads.findIndex((l) => l.id === id);
      if (idx === -1) return { next: null, result: null };
      const current = leads[idx];
      const updated: Lead = {
        ...current,
        status: patch.status ?? current.status,
        adminNotes: patch.adminNotes !== undefined ? patch.adminNotes : current.adminNotes,
      };
      const next = [...leads];
      next[idx] = updated;
      return { next, result: updated };
    })
  );
}

export async function updateLeadsBatch(
  ids: string[],
  patch: { status?: LeadStatus; adminNotes?: string }
): Promise<{ updatedCount: number }> {
  const idSet = new Set(ids);
  return enqueueWrite(() =>
    mutate<{ updatedCount: number }>((leads) => {
      let count = 0;
      const next = leads.map((l) => {
        if (idSet.has(l.id)) {
          count++;
          return {
            ...l,
            status: patch.status ?? l.status,
            adminNotes: patch.adminNotes !== undefined ? patch.adminNotes : l.adminNotes,
          };
        }
        return l;
      });
      return { next, result: { updatedCount: count } };
    })
  );
}

export async function deleteLead(id: string): Promise<boolean> {
  if (storageBackend() === "postgres") {
    const count = await postgresDelete([id]);
    return count > 0;
  }
  return enqueueWrite(() =>
    mutate<boolean>((leads) => {
      const next = leads.filter((l) => l.id !== id);
      if (next.length === leads.length) return { next: null, result: false };
      return { next, result: true };
    })
  );
}

export async function deleteLeadsBatch(ids: string[]): Promise<{ deletedCount: number }> {
  if (storageBackend() === "postgres") {
    const count = await postgresDelete(ids);
    return { deletedCount: count };
  }
  const idSet = new Set(ids);
  return enqueueWrite(() =>
    mutate<{ deletedCount: number }>((leads) => {
      const next = leads.filter((l) => !idSet.has(l.id));
      const count = leads.length - next.length;
      return { next, result: { deletedCount: count } };
    })
  );
}

/** Testlar uchun: fayl kesh'ini tozalash. */
export function __resetFileCache() {
  fileCache = null;
  writeQueue = Promise.resolve();
  receiptStore.clear();
}
