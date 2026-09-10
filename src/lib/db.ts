// Algoritm Ecosystem — PostgreSQL Central Database Engine
// Supabase, Neon yoki Vercel Postgres uchun professional drayver.
// Serverless muhitda connection pool bilan xavfsiz ishlaydi.

import { Pool, PoolConfig, type PoolClient } from "pg";

interface GlobalDbScope {
  __algoritm_db_pool__?: Pool;
  __algoritm_db_initialized__?: boolean;
}

function getDatabaseUrl(): string | null {
  const explicit =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.STORAGE_URL?.trim() ||
    process.env.STORAGE_POSTGRES_URL?.trim() ||
    process.env.STORAGE_PRISMA_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
    process.env.SUPABASE_DATABASE_URL?.trim();
  if (explicit) return explicit;

  // Har qanday Vercel prefiksi (masalan STORAGE_URL, NEON_URL va h.k.) avtomatik aniqlanadi
  for (const value of Object.values(process.env)) {
    if (
      typeof value === "string" &&
      (value.startsWith("postgres://") || value.startsWith("postgresql://"))
    ) {
      return value.trim();
    }
  }
  return null;
}

export function isDbConnected(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getPool(): Pool | null {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) return null;

  const g = globalThis as unknown as GlobalDbScope;
  if (g.__algoritm_db_pool__) {
    return g.__algoritm_db_pool__;
  }

  console.log("[Database]: Connecting to PostgreSQL database pool...");
  const isLocalhost = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

  const config: PoolConfig = {
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  };

  const pool = new Pool(config);

  pool.on("error", (err) => {
    console.error("[Database Pool Error]:", err.message);
  });

  g.__algoritm_db_pool__ = pool;
  return pool;
}

/**
 * Xavfsiz parametrlangan SQL so'rovini bajarish.
 */
export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_URL sozlanmagan. Ma'lumotlar bazasiga ulanib bo'lmadi.");
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/** Bir nechta SQL amallarini atomik bajarish uchun transaction yordamchisi. */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_URL sozlanmagan. Ma'lumotlar bazasiga ulanib bo'lmadi.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Bo'sh bazaga jadvallarni (schema.sql) avtomatik o'rnatish
 */
export async function initDatabase(): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;

  const g = globalThis as unknown as GlobalDbScope;
  if (g.__algoritm_db_initialized__) return true;

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        login VARCHAR(64) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        phone VARCHAR(32),
        password_hash VARCHAR(255),
        salt VARCHAR(64),
        telegram_id VARCHAR(64),
        telegram_username VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS groups (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        teacher_id VARCHAR(64) NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        days VARCHAR(32) NOT NULL DEFAULT 'dush-chor-juma',
        time VARCHAR(64) NOT NULL DEFAULT '14:00 - 15:30',
        room VARCHAR(64) NOT NULL DEFAULT '204-xona',
        monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 450000,
        lessons_per_month INT NOT NULL DEFAULT 12,
        active BOOLEAN NOT NULL DEFAULT true,
        telegram_id VARCHAR(64),
        telegram_username VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        parent_phone VARCHAR(32),
        group_id VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'faol',
        notes TEXT,
        enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(64) PRIMARY KEY,
        group_id VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'keldi',
        note TEXT,
        marked_by VARCHAR(255) NOT NULL DEFAULT 'Ustoz',
        marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_student_group_date UNIQUE (group_id, student_id, date)
      );

      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        type VARCHAR(32) NOT NULL,
        target_interest VARCHAR(255),
        preferred_time VARCHAR(64),
        notes TEXT,
        source VARCHAR(128),
        status VARCHAR(32) NOT NULL DEFAULT 'yangi',
        admin_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS idempotency_receipts (
        key_hash VARCHAR(128) PRIMARY KEY,
        payload_hash VARCHAR(128) NOT NULL,
        lead_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_metadata (
        key VARCHAR(128) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Old deployments may already have these tables without fields added later.
      -- Keep the startup migration idempotent so an upgrade does not turn every
      -- write into a 500 merely because the table pre-dates the current schema.
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone VARCHAR(32);
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS salt VARCHAR(64);
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(64);
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(64);
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active';
      ALTER TABLE groups ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(64);
      ALTER TABLE groups ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(64);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(32);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'faol';
      ALTER TABLE students ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS note TEXT;
      ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS marked_by VARCHAR(255) NOT NULL DEFAULT 'Ustoz';
      ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS target_interest VARCHAR(255);
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(64);
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(128);
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'yangi';
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS admin_notes TEXT;

      CREATE INDEX IF NOT EXISTS idx_attendance_group_date ON attendance_records (group_id, date);
      CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records (student_id);
      CREATE INDEX IF NOT EXISTS idx_students_group_id ON students (group_id);
      CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups (teacher_id);
      CREATE INDEX IF NOT EXISTS idx_groups_telegram_id ON groups (telegram_id);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
      CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
      CREATE INDEX IF NOT EXISTS idx_receipts_expires_at ON idempotency_receipts (expires_at);
    `);

    g.__algoritm_db_initialized__ = true;
    return true;
  } catch (err) {
    console.error("[Database Init Error]:", err);
    return false;
  }
}

/** Testlar uchun hovuzni tozalash va yopish */
export async function closePool(): Promise<void> {
  const g = globalThis as unknown as GlobalDbScope;
  if (g.__algoritm_db_pool__) {
    await g.__algoritm_db_pool__.end().catch(() => {});
    delete g.__algoritm_db_pool__;
    delete g.__algoritm_db_initialized__;
  }
}
