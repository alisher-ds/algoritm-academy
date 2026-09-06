import { describe, expect, it } from "vitest";
import { formatNumber } from "../src/components/AnimatedCounter";

describe("formatNumber — lokaldan mustaqil formatlash", () => {
  it("minglikni uzilmas probel bilan ajratadi", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(600)).toBe("600");
    expect(formatNumber(1000)).toBe("1 000");
    expect(formatNumber(1234567)).toBe("1 234 567");
  });

  it("natija muhit lokalidan qat'i nazar bir xil", () => {
    // `toLocaleString()` serverda "1,000", o'zbek/rus brauzerida "1 000" berardi —
    // aynan shu farq hydration nomuvofiqligiga olib kelardi.
    const before = process.env.LANG;
    for (const lang of ["en_US.UTF-8", "ru_RU.UTF-8", "uz_UZ.UTF-8"]) {
      process.env.LANG = lang;
      expect(formatNumber(1000)).toBe("1 000");
    }
    process.env.LANG = before;
  });
});
