-- ==============================================================================
-- ALGORITM ACADEMY & SCHOOL: DAVOMAT VA GURUHLAR BAZASI SXEMASI (PostgreSQL)
-- Bepul Supabase yoki Neon PostgreSQL uchun 1-bosishda tushirishga tayyor.
-- ==============================================================================

-- 0. Ustozlar Jadvali (Teachers)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. Guruhlar Jadvali (Groups)
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

-- 2. O'quvchilar Jadvali (Students)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  parent_phone VARCHAR(32),
  group_id VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'faol', -- 'faol', 'ketdi', 'muzlatilgan'
  notes TEXT,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Davomat Yozuvlari Jadvali (Attendance Records)
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) PRIMARY KEY,
  group_id VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'keldi', -- 'keldi', 'kelmadi', 'sababli'
  note TEXT,
  marked_by VARCHAR(255) NOT NULL DEFAULT 'Ustoz',
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_group_date UNIQUE (group_id, student_id, date)
);

-- 4. Yuqori Tezlik Uchun Indekslar (Indexes for <10ms queries)
CREATE INDEX IF NOT EXISTS idx_attendance_group_date ON attendance_records (group_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records (student_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students (group_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups (teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_telegram_id ON groups (telegram_id);
