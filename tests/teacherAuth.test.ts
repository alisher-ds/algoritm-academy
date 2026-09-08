import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTeachers,
  setTeacherPassword,
  verifyTeacherCredentials,
  createTeacherToken,
  verifyTeacherToken,
  bindTeacherTelegram,
  findTeacherByTelegram,
  hashPassword,
} from "../src/lib/teacherAuth";

describe("Teacher Authentication & Role Isolation", () => {
  beforeEach(async () => {
    // Reset test environment
    process.env.ADMIN_SESSION_SECRET = "test-secret-salt-1234567890";
  });

  it("ustozlar ro'yxatini to'g'ri yuklaydi", async () => {
    const teachers = await loadTeachers();
    expect(teachers.length).toBeGreaterThanOrEqual(5);
    const aziz = teachers.find((t) => t.id === "tm-aziz");
    expect(aziz).toBeDefined();
    expect(aziz?.name).toBe("Aziz Xolmurodov");
  });

  it("ustoz o'zi uchun yangi parol o'rnata oladi va u xavfsiz xeshlanadi", async () => {
    const updated = await setTeacherPassword("tm-aziz", "maxfiy_parol_2026");
    expect(updated).toBeDefined();
    expect(updated?.id).toBe("tm-aziz");
    // Sanitize qilingani uchun tashqi ob'ektda parol xeshi chiqmasligi kerak
    expect((updated as any).passwordHash).toBeUndefined();

    // To'g'ri parol bilan kirish
    const auth1 = await verifyTeacherCredentials("aziz", "maxfiy_parol_2026");
    expect(auth1).not.toBeNull();
    expect(auth1?.name).toBe("Aziz Xolmurodov");

    // Noto'g'ri parol bilan rad etish
    const auth2 = await verifyTeacherCredentials("aziz", "notogri_parol");
    expect(auth2).toBeNull();
  });

  it("telefon raqam orqali ham tizimga kirish mumkin", async () => {
    await setTeacherPassword("tm-jasur", "jasur_pass_777");
    // Telefon raqami orqali tekshirish
    const auth = await verifyTeacherCredentials("+998 90 123-45-02", "jasur_pass_777");
    expect(auth).not.toBeNull();
    expect(auth?.id).toBe("tm-jasur");
  });

  it("imzolangan token yaratadi va uni to'g'ri tasdiqlaydi", () => {
    const mockTeacher = {
      id: "tm-oxunjon",
      name: "Oxunjon Ozodov",
      login: "oxunjon",
      subject: "Digital SAT",
      createdAt: "2026-09-01",
    };

    const token = createTeacherToken(mockTeacher);
    expect(token).toMatch(/^t1\./);

    const payload = verifyTeacherToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.teacherId).toBe("tm-oxunjon");
    expect(payload?.name).toBe("Oxunjon Ozodov");
  });

  it("buzilgan yoki muddati o'tgan tokenni rad etadi", () => {
    const mockTeacher = {
      id: "tm-adham",
      name: "Adham Sohibov",
      login: "adham",
      subject: "Prezident Maktabi",
      createdAt: "2026-09-01",
    };

    const token = createTeacherToken(mockTeacher);
    const tampered = token + "soxta";
    expect(verifyTeacherToken(tampered)).toBeNull();

    // Muddati o'tgan token
    const expiredToken = createTeacherToken(mockTeacher, -100);
    expect(verifyTeacherToken(expiredToken)).toBeNull();
  });

  it("Telegram profilini biriktirish va Telegram orqali topish", async () => {
    await bindTeacherTelegram("tm-shohista", "123456789", "shohista_teacher");
    const found = await findTeacherByTelegram("123456789", "shohista_teacher");
    expect(found).not.toBeNull();
    expect(found?.id).toBe("tm-shohista");
  });
});
