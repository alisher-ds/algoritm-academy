import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

let dir: string;

async function store() {
  const mod = await import("../src/lib/leadStore");
  mod.__resetFileCache();
  return mod;
}

describe("leadStore (fayl backend)", () => {
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "leads-"));
    process.env.LEADS_FILE = path.join(dir, "leads.json");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("bo'sh ro'yxatdan boshlaydi (seed ma'lumot yo'q)", async () => {
    const s = await store();
    expect(await s.listLeads()).toEqual([]);
  });

  it("ariza qo'shadi va faylga saqlaydi", async () => {
    const s = await store();
    const lead = await s.addLead({
      name: "Ali",
      phone: "+998901112233",
      type: "kurs",
      targetInterest: "IELTS",
    });
    expect(lead.id).toMatch(/^lead-/);
    expect(lead.status).toBe("yangi");

    const raw = JSON.parse(await fs.readFile(process.env.LEADS_FILE!, "utf8"));
    expect(raw).toHaveLength(1);
    expect(raw[0].name).toBe("Ali");
  });

  it("statusni yangilaydi", async () => {
    const s = await store();
    const lead = await s.addLead({ name: "Ali", phone: "+998901112233", type: "kurs", targetInterest: "IELTS" });
    const updated = await s.updateLead(lead.id, { status: "boglangan", adminNotes: "qo'ng'iroq qilindi" });
    expect(updated?.status).toBe("boglangan");
    expect(updated?.adminNotes).toBe("qo'ng'iroq qilindi");
    expect(await s.updateLead("yoq", { status: "yangi" })).toBeNull();
  });

  it("arizani o'chiradi", async () => {
    const s = await store();
    const lead = await s.addLead({ name: "Ali", phone: "+998901112233", type: "kurs", targetInterest: "IELTS" });
    expect(await s.deleteLead(lead.id)).toBe(true);
    expect(await s.deleteLead(lead.id)).toBe(false);
    expect(await s.listLeads()).toEqual([]);
  });

  it("ro'yxatni yangi sanadan eskisiga tartiblaydi", async () => {
    const s = await store();
    await s.addLead({ name: "Birinchi", phone: "+998901112233", type: "kurs", targetInterest: "A" });
    await new Promise((r) => setTimeout(r, 5));
    await s.addLead({ name: "Ikkinchi", phone: "+998901112244", type: "kurs", targetInterest: "B" });
    const list = await s.listLeads();
    expect(list[0].name).toBe("Ikkinchi");
  });

  it("parallel 10 ta ariza bir vaqtda kelsa barchasi saqlanadi (race condition yo'q)", async () => {
    const s = await store();
    const tasks = Array.from({ length: 10 }, (_, i) =>
      s.addLead({
        name: `User ${i}`,
        phone: `+9989011122${i.toString().padStart(2, "0")}`,
        type: "kurs",
        targetInterest: `Kurs ${i}`,
      })
    );
    const added = await Promise.all(tasks);
    expect(added).toHaveLength(10);

    const all = await s.listLeads();
    expect(all).toHaveLength(10);
    const names = all.map((l) => l.name);
    for (let i = 0; i < 10; i++) {
      expect(names).toContain(`User ${i}`);
    }
  });

  it("Upstash env bo'lsa redis backend tanlanadi", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://x.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    const s = await store();
    expect(s.storageBackend()).toBe("redis");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("createLead bir xil Idempotency-Key bilan dublikat yaratmaydi", async () => {
    const s = await store();
    const payload = { name: "Karim", phone: "+998901112233", type: "kurs" as const, targetInterest: "IELTS" };
    const r1 = await s.createLead(payload, "key-abc-123");
    expect(r1.created).toBe(true);
    expect(r1.lead.name).toBe("Karim");

    const r2 = await s.createLead(payload, "key-abc-123");
    expect(r2.created).toBe(false);
    expect(r2.lead.id).toBe(r1.lead.id);

    const all = await s.listLeads();
    expect(all).toHaveLength(1);
  });

  it("createLead boshqa ma'lumot bilan bir xil kalit berilsa 409 xato beradi", async () => {
    const s = await store();
    await s.createLead({ name: "Karim", phone: "+998901112233", type: "kurs", targetInterest: "IELTS" }, "key-conflict");
    await expect(
      s.createLead({ name: "Salim", phone: "+998909998877", type: "kurs", targetInterest: "SAT" }, "key-conflict")
    ).rejects.toThrow("Bu yuborish kaliti boshqa ariza uchun ishlatilgan");
  });
});
