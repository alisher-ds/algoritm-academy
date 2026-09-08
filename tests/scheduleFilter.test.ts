import { describe, expect, it } from "vitest";
import { isLessonToday } from "../src/lib/attendanceTypes";

describe("Schedule & Day Filter (Bugungi darslar taqvimi)", () => {
  // 2026-09-07 — Dushanba (Monday)
  const monday = "2026-09-07";
  // 2026-09-08 — Seshanba (Tuesday)
  const tuesday = "2026-09-08";
  // 2026-09-13 — Yakshanba (Sunday)
  const sunday = "2026-09-13";

  it("Dushanba kuni faqat dush-chor-juma va har-kuni guruhlarini to'g'ri ajratadi", () => {
    expect(isLessonToday("dush-chor-juma", monday)).toBe(true);
    expect(isLessonToday("sesh-pay-shanba", monday)).toBe(false);
    expect(isLessonToday("har-kuni", monday)).toBe(true);
    expect(isLessonToday("dam-olish", monday)).toBe(false);
  });

  it("Seshanba kuni faqat sesh-pay-shanba va har-kuni guruhlarini to'g'ri ajratadi", () => {
    expect(isLessonToday("sesh-pay-shanba", tuesday)).toBe(true);
    expect(isLessonToday("dush-chor-juma", tuesday)).toBe(false);
    expect(isLessonToday("har-kuni", tuesday)).toBe(true);
  });

  it("Yakshanba kuni dam-olish guruhlarini to'g'ri ajratadi", () => {
    expect(isLessonToday("dam-olish", sunday)).toBe(true);
    expect(isLessonToday("dush-chor-juma", sunday)).toBe(false);
    expect(isLessonToday("sesh-pay-shanba", sunday)).toBe(false);
  });
});
