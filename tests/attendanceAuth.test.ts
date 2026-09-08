import { describe, it, expect, beforeEach } from "vitest";
import { GET as getGroups, POST as postGroups } from "../src/app/api/groups/route";
import { GET as getStudents, POST as postStudents } from "../src/app/api/students/route";
import { GET as getAttendance, POST as postAttendance } from "../src/app/api/attendance/route";
import { GET as getTeacherAuth, POST as postTeacherAuth } from "../src/app/api/teachers/auth/route";
import { createTeacherToken, setTeacherPassword } from "../src/lib/teacherAuth";
import { createSessionToken, AUTH_COOKIE } from "../src/lib/adminAuth";
import { createGroup } from "../src/lib/attendanceStore";

describe("Security Hardening & RBAC Tests", () => {
  const secret = "test-secret-salt-1234567890123456";

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = secret;
    process.env.TEACHER_SESSION_SECRET = secret;
    process.env.ADMIN_PASSWORD = "algoritm-admin-2026";
  });

  const mockTeacher1 = {
    id: "tm-teacher-1",
    name: "Ustoz Birinchi",
    login: "teacher1",
    subject: "Matematika",
    createdAt: "2026-09-01T00:00:00.000Z",
  };

  const mockTeacher2 = {
    id: "tm-teacher-2",
    name: "Ustoz Ikkinchi",
    login: "teacher2",
    subject: "Fizika",
    createdAt: "2026-09-01T00:00:00.000Z",
  };

  it("Anonim foydalanuvchi /api/groups, /api/students va /api/attendance ga kira olmaydi (401)", async () => {
    const unauthReq = new Request("http://localhost:3000/api/groups", {
      headers: { Origin: "http://localhost:3000" },
    });

    const resGroups = await getGroups(unauthReq);
    expect(resGroups.status).toBe(401);
    const bodyGroups = await resGroups.json();
    expect(bodyGroups.success).toBe(false);

    const resStudents = await getStudents(new Request("http://localhost:3000/api/students", {
      headers: { Origin: "http://localhost:3000" },
    }));
    expect(resStudents.status).toBe(401);

    const resAtt = await getAttendance(new Request("http://localhost:3000/api/attendance?groupId=grp-1", {
      headers: { Origin: "http://localhost:3000" },
    }));
    expect(resAtt.status).toBe(401);
  });

  it("Anonim mutatsiyalar (POST guruh, o'quvchi, davomat) 401 bilan rad etiladi", async () => {
    const postGrpReq = new Request("http://localhost:3000/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ name: "Hacker Guruhi", subject: "Cyber" }),
    });
    const resGrp = await postGroups(postGrpReq);
    expect(resGrp.status).toBe(401);

    const postStudReq = new Request("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ name: "Hacker Bola", phone: "+998901112233" }),
    });
    const resStud = await postStudents(postStudReq);
    expect(resStud.status).toBe(401);

    const postAttReq = new Request("http://localhost:3000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ records: [] }),
    });
    const resAtt = await postAttendance(postAttReq);
    expect(resAtt.status).toBe(401);
  });

  it("Ustoz faqat o'zining guruhlarini ko'radi va boshqa ustoz guruhiga kira olmaydi (403)", async () => {
    const group1 = await createGroup({
      name: "Algebra 101",
      subject: "Matematika",
      teacherId: mockTeacher1.id,
      teacherName: mockTeacher1.name,
      days: "dush-chor-juma",
      time: "14:00 - 15:30",
      room: "101",
      monthlyPrice: 400000,
      lessonsPerMonth: 12,
      active: true,
    });

    const group2 = await createGroup({
      name: "Fizika 202",
      subject: "Fizika",
      teacherId: mockTeacher2.id,
      teacherName: mockTeacher2.name,
      days: "sesh-pay-shanba",
      time: "16:00 - 17:30",
      room: "102",
      monthlyPrice: 450000,
      lessonsPerMonth: 12,
      active: true,
    });

    const token1 = createTeacherToken(mockTeacher1);

    const reqGroups = new Request("http://localhost:3000/api/groups", {
      headers: {
        Authorization: `Bearer ${token1}`,
        Origin: "http://localhost:3000",
      },
    });
    const resGroups = await getGroups(reqGroups);
    expect(resGroups.status).toBe(200);
    const dataGroups = await resGroups.json();
    const ids = dataGroups.groups.map((g: { id: string }) => g.id);
    expect(ids).toContain(group1.id);
    expect(ids).not.toContain(group2.id);

    const reqForbidden = new Request("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Notanish O'quvchi",
        phone: "+998901239988",
        groupId: group2.id,
      }),
    });
    const resForbidden = await postStudents(reqForbidden);
    expect(resForbidden.status).toBe(403);
  });

  it("Admin barcha ma'lumotlarga to'liq kirish huquqiga ega", async () => {
    const adminToken = createSessionToken();
    expect(adminToken).not.toBeNull();

    const req = new Request("http://localhost:3000/api/groups", {
      headers: {
        Cookie: `${AUTH_COOKIE}=${adminToken}`,
        Origin: "http://localhost:3000",
      },
    });
    const res = await getGroups(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.groups)).toBe(true);
  });

  it("GET /api/teachers/auth anonimlarga ustozlar ro'yxatini oshkor qilmaydi", async () => {
    const unauthReq = new Request("http://localhost:3000/api/teachers/auth");
    const res = await getTeacherAuth(unauthReq);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
    expect(data.teachers).toBeUndefined();
  });

  it("set-password mavjud parolni o'zgartirishda eski parolni (oldPassword) talab qiladi", async () => {
    const jasur = await setTeacherPassword("tm-jasur", "eski_parol_123");
    expect(jasur).not.toBeNull();

    const testIp = "192.168.99.77";

    // 1. Tizimga kirmagan begona shaxs boshqa ustozning parolini o'zgartira olmaydi (403)
    const reqAnon = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "X-Forwarded-For": testIp,
      },
      body: JSON.stringify({
        action: "set-password",
        teacherId: "tm-jasur",
        password: "yangi_parol_456",
      }),
    });

    const resAnon = await postTeacherAuth(reqAnon);
    expect(resAnon.status).toBe(403);

    // 2. Ustoz tizimga kirgan, lekin eski parolni xato kiritganda 401 qaytishi kerak
    const jasurToken = createTeacherToken(jasur!);
    const reqWrong = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jasurToken}`,
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "X-Forwarded-For": "192.168.99.78",
      },
      body: JSON.stringify({
        action: "set-password",
        teacherId: "tm-jasur",
        oldPassword: "xato_eski_parol",
        password: "yangi_parol_456",
      }),
    });

    const resWrong = await postTeacherAuth(reqWrong);
    expect(resWrong.status).toBe(401);
  });
});
