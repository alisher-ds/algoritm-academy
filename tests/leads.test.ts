import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addToOutbox, flushOutbox, getOutbox, OUTBOX_KEY, removeFromOutbox, submitLead } from '../src/lib/leads';

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(global, 'window', { value: { localStorage: localStorageMock }, writable: true });

describe('leads outbox & submitLead', () => {
  beforeEach(() => {
    storage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    storage.clear();
  });

  it("outbox ga element qo'shadi va o'chiradi", () => {
    addToOutbox('req-1', { name: 'Ali', phone : '901234567', type: 'kurs', targetInterest: 'IELTS' });
    expect(getOutbox()).toHaveLength(1);
    expect(getOutbox()[0].id).toBe('req-1');

    removeFromOutbox('req-1');
    expect(getOutbox()).toHaveLength(0);
  });

  it("submitLead muvaffaqiyatli bo'lsa Idempotency-Key jo'natadi", async () => {
    let capturedHeaders: Record<string, string> = {};
    global.fetch = vi.fn().mockImplementation(async (_url, init) => {
      capturedHeaders = (init?.headers || {}) as Record<string, string>;
      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, lead: { id: 'lead-123', name: 'Ali' } }),
      };
    });

    const res = await submitLead({ name: 'Ali', phone: '+998901234567', type: 'kurs', targetInterest: 'SAT' });
    expect(res.ok).toBe(true);
    expect(res.lead?.id).toBe('lead-123');
    expect(capturedHeaders['Idempotency-Key']).match(/^req_/);
    expect(getOutbox()).toHaveLength(0);
  });

  it("tarmoq uzilganda offline outbox ga saqlaydi", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const res = await submitLead({ name: 'Ali', phone: '+998901234567', type: 'kurs', targetInterest: 'SAT' });
    expect(res.ok).toBe(false);
    expect(res.storedLocally).toBe(true);
    expect(getOutbox()).toHaveLength(1);
  });

  it("flushOutbox tarmoq tiklanganda arizalarni qayta jo'natadi", async () => {
    addToOutbox('req-retry', { name: 'Ali', phone : '+998901234567', type: 'kurs', targetInterest: 'SAT' });
    const items = getOutbox();
    items[0].nextAttemptAt = Date.now() - 1000;
    localStorage.setItem('algoritm_lead_outbox', JSON.stringify(items));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({success: true}),
    });

    const result = await flushOutbox();
    expect(result.sent).toBe(1);
    expect(getOutbox()).toHaveLength(0);
  });
});

describe("flushOutbox — eskirgan yozuvlarni tozalash", () => {
  beforeEach(() => {
    storage.clear();
    vi.restoreAllMocks();
  });

  it("10 urinishdan oshgan va 7 kundan eski yozuvlar tashlab yuboriladi", async () => {
    // Server 500 qaytaradi — ya'ni hech biri muvaffaqiyatli yuborilmaydi.
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));

    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 3600_000).toISOString();
    storage.set(
      OUTBOX_KEY,
      JSON.stringify([
        // 7 kundan eski
        { id: "eski", payload: {}, createdAt: eightDaysAgo, attempts: 1, nextAttemptAt: 0, state: "pending" },
        // urinishlari tugagan
        { id: "charchagan", payload: {}, createdAt: new Date().toISOString(), attempts: 12, nextAttemptAt: 0, state: "pending" },
      ])
    );

    await flushOutbox();
    expect(getOutbox()).toHaveLength(0);
  });

  it("yangi va urinishlari kam yozuv navbatda qoladi", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));

    storage.set(
      OUTBOX_KEY,
      JSON.stringify([
        { id: "yangi", payload: {}, createdAt: new Date().toISOString(), attempts: 1, nextAttemptAt: 0, state: "pending" },
      ])
    );

    await flushOutbox();
    const left = getOutbox();
    expect(left).toHaveLength(1);
    expect(left[0].attempts).toBe(2); // urinish soni oshdi, lekin tashlanmadi
  });
});
