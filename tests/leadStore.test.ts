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

  it("Upstash env bo'lsa redis backend tanlanadi", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://x.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    const s = await store();
    expect(s.storageBackend()).toBe("redis");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });
});
