import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

let dir: string;

function post(body: unknown, headers: Record<string, string> = {}) {
  const payload = JSON.stringify(body);
  return new Request("http://site.uz/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "site.uz",
      origin: "http://site.uz",
      "x-real-ip": `10.0.0.${Math.floor(Math.random() * 250)}`,
      ...headers,
    },
    body: payload,
  });
}

async function api() {
  vi.resetModules();
  const store = await import("../src/lib/leadStore");
  store.__resetFileCache();
  return import("../src/app/api/leads/route");
}

describe("/api/leads", () => {
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "leadsapi-"));
    process.env.LEADS_FILE = path.join(dir, "leads.json");
    process.env.ADMIN_PASSWORD = "test-parol-123";
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("to'g'ri arizani qabul qiladi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "Ali Valiyev", phone: "+998 90 111 22 33", type: "kurs" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.lead.name).toBe("Ali Valiyev");
  });

  it("noto'g'ri ism/telefonni rad etadi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "A", phone: "abc" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("cross-origin so'rovni bloklaydi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "Ali Valiyev", phone: "+998901112233" }, { origin: "http://yovuz.uz" }));
    expect(res.status).toBe(403);
  });

  it("honeypot to'ldirilgan so'rovni jimgina yutadi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "Bot", phone: "+998901112233", website: "spam.com" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.lead).toBeUndefined();
  });

  it("nazorat belgilarini tozalaydi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "Ali\n\nValiyev\t", phone: "+998901112233" }));
    const data = await res.json();
    expect(data.lead.name).toBe("Ali Valiyev");
  });

  it("GET admin cookie'siz 401 qaytaradi", async () => {
    const { GET } = await api();
    const res = await GET(new Request("http://site.uz/api/leads"));
    expect(res.status).toBe(401);
  });

  it("GET haqiqiy sessiya bilan ro'yxat qaytaradi", async () => {
    const { GET, POST } = await api();
    await POST(post({ name: "Ali Valiyev", phone: "+998901112233" }));
    const auth = await import("../src/lib/adminAuth");
    const token = auth.createSessionToken()!;
    const res = await GET(
      new Request("http://site.uz/api/leads", { headers: { cookie: `${auth.AUTH_COOKIE}=${token}` } })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.leads).toHaveLength(1);
  });

  it("PATCH/DELETE ruxsatsiz 401", async () => {
    const { PATCH, DELETE } = await api();
    expect((await PATCH(post({ id: "x", status: "yangi" }))).status).toBe(401);
    expect(
      (await DELETE(new Request("http://site.uz/api/leads?id=x", { method: "DELETE" }))).status
    ).toBe(401);
  });

  it("rate-limit ishlaydi (1 daqiqada 5 ta)", async () => {
    const { POST } = await api();
    const ip = "203.0.113.77";
    let last = 0;
    for (let i = 0; i < 7; i++) {
      const res = await POST(
        post({ name: `Ali Valiyev ${i}`, phone: "+998901112233" }, { "x-real-ip": ip })
      );
      last = res.status;
    }
    expect(last).toBe(429);
  });

  it("Idempotency-Key bilan qayta yuborilgan ariza takroran qo'shilmaydi (replay 200)", async () => {
    const { POST } = await api();
    const key = "test-idem-key-12345";
    const res1 = await POST(
      post({ name: "Vali Aliyev", phone: "+998901234567", targetInterest: "SAT" }, { "idempotency-key": key })
    );
    expect(res1.status).toBe(201);
    const d1 = await res1.json();
    expect(d1.success).toBe(true);
    expect(d1.created).toBe(true);

    const res2 = await POST(
      post({ name: "Vali Aliyev", phone: "+998901234567", targetInterest: "SAT" }, { "idempotency-key": key })
    );
    expect(res2.status).toBe(200);
    const d2 = await res2.json();
    expect(d2.success).toBe(true);
    expect(d2.created).toBe(false);
    expect(d2.lead.id).toBe(d1.lead.id);
  });

  it("bir xil Idempotency-Key boshqa ariza uchun ishlatilsa 409 Conflict qaytaradi", async () => {
    const { POST } = await api();
    const key = "test-idem-conflict";
    const res1 = await POST(
      post({ name: "Birinchi Foydalanuvchi", phone: "+998901234567" }, { "idempotency-key": key })
    );
    expect(res1.status).toBe(201);

    const res2 = await POST(
      post({ name: "Ikkinchi Boshqa Ism", phone: "+998907654321" }, { "idempotency-key": key })
    );
    expect(res2.status).toBe(409);
    const d2 = await res2.json();
    expect(d2.success).toBe(false);
    expect(d2.error).toContain("Bu yuborish kaliti boshqa ariza uchun ishlatilgan");
  });
});

describe("/api/leads/auth", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-parol-123";
  });

  it("noto'g'ri parolni rad, to'g'risini qabul qiladi", async () => {
    vi.resetModules();
    const { POST } = await import("../src/app/api/leads/auth/route");
    const mk = (password: string) =>
      new Request("http://site.uz/api/leads/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "site.uz",
          origin: "http://site.uz",
          "x-real-ip": `10.1.0.${Math.floor(Math.random() * 250)}`,
        },
        body: JSON.stringify({ password }),
      });
    expect((await POST(mk("xato"))).status).toBe(401);
    const ok = await POST(mk("test-parol-123"));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toContain("HttpOnly");
  });
});
