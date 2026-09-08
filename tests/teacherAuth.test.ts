import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTeachers,
  setTeacherPassword,
  registerTeacher,
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

  it("yangi ustoz mustaqil ro'yxatdan o'ta oladi va o'z paroli bilan tizimga kira oladi", async () => {
    const testLogin = `dilshod_${Date.now()}`;
    const regResult = await registerTeacher({
      name: "Dilshod Mahmudov",
      login: testLogin,
      subject: "Oliy Matematika",
      phone: "+998 93 999-88-77",
      password: "dilshod_parol_2026",
    });

    expect(regResult.error).toBeUndefined();
    expect(regResult.teacher).toBeDefined();
    expect(regResult.teacher?.name).toBe("Dilshod Mahmudov");

    // Login va parol orqali kirishni tekshirish
    const auth = await verifyTeacherCredentials(testLogin, "dilshod_parol_2026");
    expect(auth).not.toBeNull();
    expect(auth?.name).toBe("Dilshod Mahmudov");
  });

  it("takroriy login bilan ro'yxatdan o'tishni rad etadi", async () => {
    const duplicateLogin = `dup_${Date.now()}`;
    await registerTeacher({
      name: "Birinchi Ustoz",
      login: duplicateLogin,
      subject: "Fizika",
      password: "parol_birinchi",
    });

    const res = await registerTeacher({
      name: "Ikkinchi Ustoz",
      login: duplicateLogin, // allaqachon mavjud
      subject: "Kimyo",
      password: "boshqa_parol",
    });

    expect(res.error).toBeDefined();
    expect(res.teacher).toBeUndefined();
  });
});
