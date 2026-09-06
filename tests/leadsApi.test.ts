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

  it("rememberMe=false bo'lganda brauzer sessiyasi cookie (Max-Age siz) o'rnatadi", async () => {
    vi.resetModules();
    const { POST } = await import("../src/app/api/leads/auth/route");
    const res = await POST(
      new Request("http://site.uz/api/leads/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "site.uz",
          origin: "http://site.uz",
        },
        body: JSON.stringify({ password: "test-parol-123", rememberMe: false }),
      })
    );
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie.toLowerCase()).not.toContain("max-age");
  });

  it("rememberMe=true bo'lganda 7 kunlik doimiy cookie (Max-Age bilan) o'rnatadi", async () => {
    vi.resetModules();
    const { POST } = await import("../src/app/api/leads/auth/route");
    const res = await POST(
      new Request("http://site.uz/api/leads/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "site.uz",
          origin: "http://site.uz",
        },
        body: JSON.stringify({ password: "test-parol-123", rememberMe: true }),
      })
    );
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie.toLowerCase()).toContain("max-age=604800");
  });
});

describe("/api/leads — kirish validatsiyasi", () => {
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "leadsval-"));
    process.env.LEADS_FILE = path.join(dir, "leads.json");
    process.env.ADMIN_PASSWORD = "test-parol-123";
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("ko'rinmas belgilardan iborat ismni rad etadi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "\u200b\u200b\u200b", phone: "901112233", type: "kurs" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Ismni to'liq kiriting/);
  });

  it("soxta operator kodli telefonni rad etadi", async () => {
    const { POST } = await api();
    const res = await POST(post({ name: "Ali Valiyev", phone: "000000000", type: "kurs" }));
    expect(res.status).toBe(400);
  });

  it("ro'yxatda yo'q yo'nalishni erkin matn sifatida qabul qilmaydi", async () => {
    const { POST } = await api();
    const res = await POST(
      post({
        name: "Ali Valiyev",
        phone: "901112233",
        type: "kurs",
        targetInterest: "CLICK https://spam.example FREE MONEY",
      })
    );
    expect(res.status).toBe(201);
    expect((await res.json()).lead.targetInterest).toBe("Boshqa yo'nalish / Maslahat olish");
  });

  it("ro'yxatdagi yo'nalishni saqlab qoladi", async () => {
    const { POST } = await api();
    const res = await POST(
      post({ name: "Ali Valiyev", phone: "901112244", type: "kurs", targetInterest: "Digital SAT" })
    );
    expect(res.status).toBe(201);
    expect((await res.json()).lead.targetInterest).toBe("Digital SAT");
  });

  it("noma'lum manbani 'sayt' ga tushiradi", async () => {
    const { POST } = await api();
    const res = await POST(
      post({ name: "Ali Valiyev", phone: "901112255", type: "kurs", source: "reklama-spam" })
    );
    expect(res.status).toBe(201);
    expect((await res.json()).lead.source).toBe("sayt");
  });

  it("soxta X-Forwarded-For bilan cheksiz ariza yuborib bo'lmaydi (global shift)", async () => {
    const { POST } = await api();
    let blocked = false;
    // Har so'rovda YANGI soxta IP — ilgari bu per-IP chegarani butunlay aylanib o'tardi.
    for (let i = 0; i < 70; i++) {
      const res = await POST(
        post(
          { name: `Bot ${i}`, phone: `9011${String(i).padStart(5, "0")}`, type: "kurs" },
          { "x-forwarded-for": `203.0.113.${i % 250}`, "x-real-ip": `203.0.113.${i % 250}` }
        )
      );
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });

  it("ustoz konsultatsiyasi va izohni (notes) to'g'ri saqlaydi", async () => {
    const { POST } = await api();
    const res = await POST(
      post({
        name: "Sardor Aliyev",
        phone: "901234567",
        type: "kurs",
        targetInterest: "Digital SAT",
        notes: "Bobur Xaydarov bilan suhbat",
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.lead.notes).toBe("Bobur Xaydarov bilan suhbat");
  });

  it("GET /api/leads qidiruv va filtr parametrlari bilan to'g'ri ishlaydi", async () => {
    const { POST, GET } = await api();
    const auth = await import("../src/lib/adminAuth");
    const token = auth.createSessionToken()!;

    await POST(
      post({ name: "Farrux Zokirov", phone: "901112233", type: "maktab", targetInterest: "0–11 Sinf Xususiy Maktabi" })
    );
    await POST(
      post({ name: "Jasur Qodirov", phone: "909998877", type: "kurs", targetInterest: "Digital SAT" })
    );

    const getReq = (query: string) =>
      new Request(`http://site.uz/api/leads?${query}`, {
        method: "GET",
        headers: {
          host: "site.uz",
          cookie: `${auth.AUTH_COOKIE}=${token}`,
        },
      });

    // Search query
    const resSearch = await GET(getReq("search=Farrux"));
    expect(resSearch.status).toBe(200);
    const dataSearch = await resSearch.json();
    expect(dataSearch.leads).toHaveLength(1);
    expect(dataSearch.leads[0].name).toBe("Farrux Zokirov");

    // Type query
    const resType = await GET(getReq("type=kurs"));
    expect(resType.status).toBe(200);
    const dataType = await resType.json();
    expect(dataType.leads).toHaveLength(1);
    expect(dataType.leads[0].name).toBe("Jasur Qodirov");

    // Stats tekshiruvi
    expect(dataType.stats).toBeDefined();
    expect(dataType.stats.total).toBe(2);
    expect(dataType.stats.todayCount).toBe(2);
  });

  it("PATCH /api/leads to'plam (batch) ID lar bilan statusni yangilaydi", async () => {
    const { POST, PATCH, GET } = await api();
    const auth = await import("../src/lib/adminAuth");
    const token = auth.createSessionToken()!;

    const r1 = await POST(post({ name: "Arizachi 1", phone: "901110001" }));
    const d1 = await r1.json();
    const r2 = await POST(post({ name: "Arizachi 2", phone: "901110002" }));
    const d2 = await r2.json();

    const patchReq = new Request("http://site.uz/api/leads", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        host: "site.uz",
        origin: "http://site.uz",
        cookie: `${auth.AUTH_COOKIE}=${token}`,
      },
      body: JSON.stringify({
        ids: [d1.lead.id, d2.lead.id],
        status: "boglangan",
        adminNotes: "Admin tomonidan tekshirildi",
      }),
    });

    const patchRes = await PATCH(patchReq);
    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.success).toBe(true);
    expect(patchData.count).toBe(2);

    const getRes = await GET(
      new Request("http://site.uz/api/leads", {
        headers: { host: "site.uz", cookie: `${auth.AUTH_COOKIE}=${token}` },
      })
    );
    const getData = await getRes.json();
    for (const item of getData.leads) {
      expect(item.status).toBe("boglangan");
      expect(item.adminNotes).toBe("Admin tomonidan tekshirildi");
    }
  });

  it("DELETE /api/leads to'plam (batch) ID larni o'chiradi", async () => {
    const { POST, DELETE, GET } = await api();
    const auth = await import("../src/lib/adminAuth");
    const token = auth.createSessionToken()!;

    const r1 = await POST(post({ name: "Arizachi 1", phone: "901110001" }));
    const d1 = await r1.json();
    const r2 = await POST(post({ name: "Arizachi 2", phone: "901110002" }));
    const d2 = await r2.json();
    await POST(post({ name: "Arizachi 3", phone: "901110003" }));

    const deleteReq = new Request(
      `http://site.uz/api/leads?ids=${d1.lead.id},${d2.lead.id}`,
      {
        method: "DELETE",
        headers: {
          host: "site.uz",
          origin: "http://site.uz",
          cookie: `${auth.AUTH_COOKIE}=${token}`,
        },
      }
    );

    const deleteRes = await DELETE(deleteReq);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);
    expect(deleteData.count).toBe(2);

    const getRes = await GET(
      new Request("http://site.uz/api/leads", {
        headers: { host: "site.uz", cookie: `${auth.AUTH_COOKIE}=${token}` },
      })
    );
    const getData = await getRes.json();
    expect(getData.leads).toHaveLength(1);
    expect(getData.leads[0].name).toBe("Arizachi 3");
  });
});
