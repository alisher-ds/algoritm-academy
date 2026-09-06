import { describe, expect, it } from "vitest";
import { cleanText, sanitizeCsvField } from "../src/lib/sanitize";

describe("sanitize utility", () => {
  it("cleanText nazorat va ko'rinmas belgilarni tozalaydi", () => {
    expect(cleanText("  Ali \u0000 \t Valiyev \n ")).toBe("Ali Valiyev");
    expect(cleanText("   ")).toBe("");
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
    expect(cleanText("1234567890", 5)).toBe("12345");
  });

  it("sanitizeCsvField formula va DDE injection belgilarini zararsizlantiradi", () => {
    // Odatiy matn
    expect(sanitizeCsvField("Salom dunyo")).toBe('"Salom dunyo"');

    // Excel formula belgilari (=, +, -, @, |, %)
    expect(sanitizeCsvField("=SUM(A1:A10)")).toBe(`"'=SUM(A1:A10)"`);
    expect(sanitizeCsvField("+12345")).toBe(`"'+12345"`);
    expect(sanitizeCsvField("-cmd|' /C calc'!A0")).toBe(`"'-cmd|' /C calc'!A0"`);
    expect(sanitizeCsvField("@SUM(1+1)")).toBe(`"'@SUM(1+1)"`);
    expect(sanitizeCsvField("|cmd /C calc")).toBe(`"'|cmd /C calc"`);
    expect(sanitizeCsvField("%USERNAME%")).toBe(`"'%USERNAME%"`);

    // Qo'shtirnoqlarni to'g'ri ekranlash
    expect(sanitizeCsvField('Ali "Katta" Valiyev')).toBe('"Ali ""Katta"" Valiyev"');

    // Yangi qatorlarni bitta bo'shliqqa aylantirish
    expect(sanitizeCsvField("Birinchi qator\nIkkinchi qator")).toBe('"Birinchi qator Ikkinchi qator"');

    // Bo'sh yoki null qiymatlar
    expect(sanitizeCsvField(null)).toBe('""');
    expect(sanitizeCsvField(undefined)).toBe('""');
  });
});
