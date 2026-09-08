import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTeachers,
  setTeacherPassword,
  registerTeacher,
  deleteTeacher,
  resetTeachers,
  verifyTeacherCredentials,
  createTeacherToken,
  verifyTeacherToken,
  createTeacherByAdmin,
  updateTeacherStatus,
  adminResetTeacherPassword,
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
    expect((updated as unknown as Record<string, unknown>).passwordHash).toBeUndefined();

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
    expect(regResult.teacher?.status).toBe("pending");

    // Login va parol orqali hisob topilishini tekshirish
    const auth = await verifyTeacherCredentials(testLogin, "dilshod_parol_2026");
    expect(auth).not.toBeNull();
    expect(auth?.name).toBe("Dilshod Mahmudov");
    expect(auth?.status).toBe("pending");
  });

  it("admin to'g'ridan-to'g'ri faol ustoz yarata oladi", async () => {
    const adminLogin = `admin_created_${Date.now()}`;
    const result = await createTeacherByAdmin({
      name: "Sardor Aliyev",
      login: adminLogin,
      subject: "Informatika",
      phone: "+998 90 777-11-22",
      password: "sardor_super_pass",
    });

    expect(result.error).toBeUndefined();
    expect(result.teacher).toBeDefined();
    expect(result.teacher?.status).toBe("active");

    const auth = await verifyTeacherCredentials(adminLogin, "sardor_super_pass");
    expect(auth).not.toBeNull();
    expect(auth?.status).toBe("active");
  });

  it("admin ustoz statusini tasdiqlashi (active) yoki bloklashi (blocked) mumkin", async () => {
    const userLogin = `status_test_${Date.now()}`;
    const reg = await registerTeacher({
      name: "Sinov Ustoz",
      login: userLogin,
      subject: "Tarix",
      password: "sinov_pass_123",
    });
    expect(reg.teacher?.status).toBe("pending");
    const teacherId = reg.teacher!.id;

    // Admin tasdiqlaydi (active)
    const approved = await updateTeacherStatus(teacherId, "active");
    expect(approved?.status).toBe("active");

    // Admin bloklaydi (blocked)
    const blocked = await updateTeacherStatus(teacherId, "blocked");
    expect(blocked?.status).toBe("blocked");
  });

  it("admin ustoz parolini to'g'ridan-to'g'ri reset qila oladi", async () => {
    const resetLogin = `reset_test_${Date.now()}`;
    const reg = await registerTeacher({
      name: "Reset Ustoz",
      login: resetLogin,
      subject: "Biologiya",
      password: "eski_parol_999",
    });
    const teacherId = reg.teacher!.id;

    // Admin parolni yangilaydi
    const updated = await adminResetTeacherPassword(teacherId, "yangi_parol_000");
    expect(updated).not.toBeNull();

    // Eski parol ishlamasligi kerak
    const authOld = await verifyTeacherCredentials(resetLogin, "eski_parol_999");
    expect(authOld).toBeNull();

    // Yangi parol ishlashi kerak
    const authNew = await verifyTeacherCredentials(resetLogin, "yangi_parol_000");
    expect(authNew).not.toBeNull();
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

  it("ustozni o'chira oladi va ro'yxatdan chiqaradi", async () => {
    const delLogin = `del_${Date.now()}`;
    const reg = await registerTeacher({
      name: "O'chiriladigan Ustoz",
      login: delLogin,
      subject: "Biologiya",
      password: "pass_delete_123",
    });
    expect(reg.teacher).toBeDefined();

    const deleted = await deleteTeacher(delLogin);
    expect(deleted).toBe(true);

    const check = await verifyTeacherCredentials(delLogin, "pass_delete_123");
    expect(check).toBeNull();
  });

  it("resetTeachers barcha ustozlarni toza holatga qaytaradi", async () => {
    const fresh = await resetTeachers();
    expect(fresh.length).toBeGreaterThanOrEqual(6);
  });
});
