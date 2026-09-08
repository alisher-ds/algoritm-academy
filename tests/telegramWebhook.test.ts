import { describe, expect, it } from "vitest";
import { GET, POST } from "../src/app/api/telegram/webhook/route";
import {
  sendAttendanceReportNotification,
  sendNewStudentNotification,
  sendNewGroupNotification,
} from "../src/lib/attendanceTelegram";

describe("Telegram Webhook & Attendance Notifications", () => {
  it("GET /api/telegram/webhook token yo'qligida ham xizmat holatini to'g'ri qaytaradi", async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.configured).toBe(false);
  });

  it("POST /api/telegram/webhook /start buyrug'iga xatoliksiz javob beradi", async () => {
    const req = new Request("http://localhost:3000/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          chat: { id: 123456 },
          text: "/start",
          from: { first_name: "Aziz", last_name: "Xolmurodov" },
        },
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("POST /api/telegram/webhook /davomat va /guruhlar buyruqlariga xatoliksiz javob beradi", async () => {
    const reqDavomat = new Request("http://localhost:3000/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          chat: { id: 123456 },
          text: "/davomat",
        },
      }),
    });
    const resDavomat = await POST(reqDavomat);
    expect(resDavomat.status).toBe(200);

    const reqGuruhlar = new Request("http://localhost:3000/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          chat: { id: 123456 },
          text: "/guruhlar",
        },
      }),
    });
    const resGuruhlar = await POST(reqGuruhlar);
    expect(resGuruhlar.status).toBe(200);
  });

  it("Bildirishnoma yuboruvchilar token yo'qligida ham gracefully ishlaydi (server to'xtab qolmaydi)", async () => {
    const attRes = await sendAttendanceReportNotification({
      groupName: "SAT Math Intensive",
      teacherName: "Aziz Xolmurodov",
      date: "2026-09-08",
      totalCount: 15,
      presentCount: 12,
      excusedCount: 2,
      absentCount: 1,
    });
    expect(attRes.success).toBe(true);

    const stdRes = await sendNewStudentNotification({
      studentName: "Bobur Rahmonov",
      groupName: "IELTS Intensive",
      phone: "+998 90 123 45 67",
      monthlyPrice: 450000,
    });
    expect(stdRes.success).toBe(true);

    const grpRes = await sendNewGroupNotification({
      groupName: "Prezident Maktabi Tayyorlov",
      subject: "Mantiq & Matematika",
      teacherName: "Adham Sohibov",
      days: "dush-chor-juma",
      time: "16:00 - 17:30",
      room: "204-xona",
      monthlyPrice: 500000,
    });
    expect(grpRes.success).toBe(true);
  });
});
