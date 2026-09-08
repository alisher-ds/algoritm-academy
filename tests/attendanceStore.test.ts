import { describe, expect, it } from "vitest";
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  listStudents,
  createStudent,
  updateStudent,
  recordAttendance,
  getAttendance,
  calculateMonthlyBilling,
} from "../src/lib/attendanceStore";

describe("attendanceStore & Billing Engine", () => {
  it("boshlang'ich guruhlarni muvaffaqiyatli yuklaydi (Aziz va Jasur ustozlar guruhi mavjud)", async () => {
    const groups = await listGroups();
    expect(groups.length).toBeGreaterThanOrEqual(3);
    const azizGroup = groups.find((g) => g.teacherId === "tm-aziz");
    expect(azizGroup).toBeDefined();
    expect(azizGroup?.name).toContain("SAT");
  });

  it("yangi guruh yaratadi, yangilaydi va o'chiradi", async () => {
    const newGroup = await createGroup({
      name: "IELTS Intensive Test",
      subject: "Ingliz tili",
      teacherId: "tm-jasur",
      teacherName: "Jasur Jovliyev",
      days: "sesh-pay-shanba",
      time: "18:00 - 19:30",
      room: "301-xona",
      monthlyPrice: 500000,
      lessonsPerMonth: 12,
      active: true,
    });
    expect(newGroup.id).toBeTruthy();
    expect(newGroup.name).toBe("IELTS Intensive Test");

    const updated = await updateGroup(newGroup.id, { room: "305-xona" });
    expect(updated?.room).toBe("305-xona");

    const ok = await deleteGroup(newGroup.id);
    expect(ok).toBe(true);
  });

  it("o'quvchi qo'shadi, guruh bo'yicha filtrlaydi va statusini yangilaydi", async () => {
    const student = await createStudent({
      name: "Shahzod Murodov",
      phone: "+998 90 999 88 77",
      groupId: "grp_sat_aziz",
      status: "faol",
    });
    expect(student.id).toBeTruthy();

    const list = await listStudents({ groupId: "grp_sat_aziz" });
    expect(list.some((s) => s.id === student.id)).toBe(true);

    const updated = await updateStudent(student.id, { status: "ketdi" });
    expect(updated?.status).toBe("ketdi");
  });

  it("davomatni saqlaydi va bir kunda qayta belgilansa yangilaydi (idempotent)", async () => {
    const today = "2026-09-08";
    const res = await recordAttendance([
      {
        groupId: "grp_sat_aziz",
        studentId: "std_101",
        date: today,
        status: "keldi",
        markedBy: "Aziz Xolmurodov",
      },
      {
        groupId: "grp_sat_aziz",
        studentId: "std_102",
        date: today,
        status: "sababli",
        note: "Kasal bo'lgan",
        markedBy: "Aziz Xolmurodov",
      },
    ]);
    expect(res.savedCount).toBe(2);

    const records = await getAttendance("grp_sat_aziz", today);
    expect(records.length).toBe(2);
    const s102 = records.find((r) => r.studentId === "std_102");
    expect(s102?.status).toBe("sababli");
    expect(s102?.note).toBe("Kasal bo'lgan");
  });

  it("12 ta darsdan 4 tasiga uzrli (sababli) kelmagan o'quvchining to'lovini to'g'ri ayirib hisoblaydi", async () => {
    // Guruh: 12 ta dars, 450 000 so'm (1 dars = 37 500 so'm)
    // 4 ta sababli dars: 4 * 37 500 = 150 000 so'm chegirma
    // Yakuniy to'lov: 450 000 - 150 000 = 300 000 so'm
    const month = "2026-10";
    const dates = [
      "2026-10-01", "2026-10-03", "2026-10-05", "2026-10-08",
      "2026-10-10", "2026-10-12", "2026-10-15", "2026-10-17",
      "2026-10-19", "2026-10-22", "2026-10-24", "2026-10-26"
    ];

    // std_101: 8 ta dars keldi, 4 ta dars sababli (uzrli)
    const testRecords = dates.map((d, idx) => ({
      groupId: "grp_sat_aziz",
      studentId: "std_101",
      date: d,
      status: (idx < 8 ? "keldi" : "sababli") as "keldi" | "sababli",
      markedBy: "Aziz Xolmurodov",
    }));

    await recordAttendance(testRecords);

    const billing = await calculateMonthlyBilling("grp_sat_aziz", month);
    const s101Billing = billing.find((b) => b.studentId === "std_101");

    expect(s101Billing).toBeDefined();
    expect(s101Billing?.attendedCount).toBe(8);
    expect(s101Billing?.excusedCount).toBe(4);
    expect(s101Billing?.baseMonthlyPrice).toBe(450000);
    // 450 000 / 12 = 37 500
    expect(s101Billing?.perLessonPrice).toBe(37500);
    // 4 * 37 500 = 150 000 chegirma
    expect(s101Billing?.excusedDeduction).toBe(150000);
    // 450 000 - 150 000 = 300 000 so'm yakuniy to'lov!
    expect(s101Billing?.finalPayable).toBe(300000);
  });
});
