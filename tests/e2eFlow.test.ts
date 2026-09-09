import { describe, it, expect, beforeEach } from "vitest";
import { POST as teacherAuthPost, GET as teacherAuthGet } from "../src/app/api/teachers/auth/route";
import { POST as groupsPost } from "../src/app/api/groups/route";
import { POST as studentsPost } from "../src/app/api/students/route";
import { POST as attendancePost, GET as attendanceGet } from "../src/app/api/attendance/route";
import { __resetTeacherCache } from "../src/lib/teacherAuth";
import { __resetAttendanceCache } from "../src/lib/attendanceStore";
import { createSessionToken, AUTH_COOKIE } from "../src/lib/adminAuth";
import os from "os";
import path from "path";
import { promises as fs } from "fs";

describe("E2E User Flow", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vitest-flow-"));
    process.env.TEACHERS_FILE = path.join(tempDir, "teachers.json");
    process.env.ATTENDANCE_FILE = path.join(tempDir, "attendance.json");
    process.env.ADMIN_PASSWORD = "algoritm-admin-2026";
    process.env.ADMIN_SESSION_SECRET = "test-secret-salt-1234567890";
    __resetTeacherCache();
    __resetAttendanceCache();
  });

  it("completes full lifecycle seamlessly", async () => {
    const adminToken = createSessionToken();
    const adminCookie = `${AUTH_COOKIE}=${adminToken}`;

    // 1. Register teacher
    const regReq = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        action: "register",
        name: "Temur Olimov",
        subject: "Fizika",
        login: "temur_fizika",
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    const regRes = await teacherAuthPost(regReq);
    const regData = await regRes.json();
    expect(regRes.status).toBe(200);
    expect(regData.success).toBe(true);
    expect(regData.isPending).toBe(true);
    const newTeacherId = regData.teacher.id;

    // 2. Pending teacher cannot login
    const loginFailReq = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        action: "login",
        login: "temur_fizika",
        password: "password123",
      }),
    });
    const loginFailRes = await teacherAuthPost(loginFailReq);
    expect(loginFailRes.status).toBe(403);

    // 3. Admin sees teacher in list
    const adminListReq = new Request("http://localhost:3000/api/teachers/auth?scope=admin", {
      method: "GET",
      headers: {
        Cookie: adminCookie,
        Origin: "http://localhost:3000",
      },
    });
    const adminListRes = await teacherAuthGet(adminListReq);
    const adminListData = await adminListRes.json();
    expect(adminListData.teachers.some((t: { id: string }) => t.id === newTeacherId)).toBe(true);

    // 4. Admin approves teacher
    const approveReq = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        action: "admin-update-status",
        teacherId: newTeacherId,
        status: "active",
      }),
    });
    const approveRes = await teacherAuthPost(approveReq);
    const approveData = await approveRes.json();
    expect(approveRes.status).toBe(200);
    expect(approveData.success).toBe(true);

    // 5. Teacher logs in successfully
    const loginSuccessReq = new Request("http://localhost:3000/api/teachers/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        action: "login",
        login: "temur_fizika",
        password: "password123",
      }),
    });
    const loginSuccessRes = await teacherAuthPost(loginSuccessReq);
    const loginSuccessData = await loginSuccessRes.json();
    expect(loginSuccessRes.status).toBe(200);
    expect(loginSuccessData.success).toBe(true);
    const teacherToken = loginSuccessData.token;

    // 6. Teacher creates group
    const addGroupReq = new Request("http://localhost:3000/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teacherToken}`,
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Fizika 10-sinf",
        subject: "Fizika",
        days: "dush-chor-juma",
        time: "15:00 - 16:30",
        room: "101-xona",
        monthlyPrice: 400000,
        lessonsPerMonth: 12,
      }),
    });
    const addGroupRes = await groupsPost(addGroupReq);
    const addGroupData = await addGroupRes.json();
    expect(addGroupRes.status).toBe(201);
    const groupId = addGroupData.group.id;

    // 7. Teacher creates student
    const addStudentReq = new Request("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teacherToken}`,
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Olim Olimov",
        phone: "+998 90 987 65 43",
        groupId,
        status: "faol",
      }),
    });
    const addStudentRes = await studentsPost(addStudentReq);
    const addStudentData = await addStudentRes.json();
    expect(addStudentRes.status).toBe(201);
    const studentId = addStudentData.student.id;

    // 8. Teacher marks attendance
    const addAttReq = new Request("http://localhost:3000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teacherToken}`,
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        records: [
          {
            groupId,
            studentId,
            date: "2026-09-09",
            status: "keldi",
            markedBy: "Temur Olimov",
          },
        ],
      }),
    });
    const addAttRes = await attendancePost(addAttReq);
    const addAttData = await addAttRes.json();
    expect(addAttRes.status).toBe(200);
    expect(addAttData.success).toBe(true);

    // 9. Admin checks billing
    const readAttReq = new Request(`http://localhost:3000/api/attendance?groupId=${groupId}&month=2026-09&billing=true`, {
      method: "GET",
      headers: {
        Cookie: adminCookie,
        Origin: "http://localhost:3000",
      },
    });
    const readAttRes = await attendanceGet(readAttReq);
    const readAttData = await readAttRes.json();
    expect(readAttRes.status).toBe(200);
    expect(readAttData.billing.length).toBe(1);
    expect(readAttData.billing[0].studentName).toBe("Olim Olimov");
    expect(readAttData.billing[0].attendedCount).toBe(1);
  });
});
