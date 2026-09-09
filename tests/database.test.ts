import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDbConnected, getPool, closePool } from "../src/lib/db";
import { storageBackend as leadStorageBackend } from "../src/lib/leadStore";

describe("PostgreSQL Database Engine & Serverless Shared Storage", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_PRISMA_URL;
    delete process.env.SUPABASE_DATABASE_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
  });

  afterEach(async () => {
    await closePool();
    process.env = { ...originalEnv };
  });

  it("DATABASE_URL bo'lmaganda isDbConnected() false qaytaradi", () => {
    expect(isDbConnected()).toBe(false);
  });

  it("DATABASE_URL yoki POSTGRES_URL sozlanganida isDbConnected() true qaytaradi", () => {
    process.env.DATABASE_URL = "postgres://postgres:password@localhost:5432/algoritm_db";
    expect(isDbConnected()).toBe(true);

    delete process.env.DATABASE_URL;
    process.env.POSTGRES_URL = "postgres://default:pass@ep-cool-pooler.eu-central-1.neon.tech/neondb";
    expect(isDbConnected()).toBe(true);
  });

  it("DATABASE_URL mavjud bo'lsa, leadStore avtomatik 'postgres' saqlash backend'ini tanlaydi", () => {
    expect(leadStorageBackend()).toBe("file");

    process.env.DATABASE_URL = "postgres://supabase_user:secret@db.supabase.co:5432/postgres";
    expect(leadStorageBackend()).toBe("postgres");
  });

  it("Cloud PostgreSQL (Neon/Supabase) uchun SSL konfiguratsiyasi avtomatik faollashadi", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@ep-sparkling-base.eu-central-1.aws.neon.tech/neondb";
    const pool = getPool();
    expect(pool).not.toBeNull();
    // Localhost bo'lmagani uchun ssl sozlamasi mavjud bo'lishi kerak
    expect((pool?.options as unknown as Record<string, unknown>).ssl).toBeDefined();
    await closePool();
  });
});
