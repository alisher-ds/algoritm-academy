import { describe, expect, it } from 'vitest';
import { normalizeUzPhone, formatUzPhone } from '../src/lib/phone';

describe('phone utility', () => {
  it("to'g'ri 9 xonali raqamlarni normallashtiradi", () => {
    expect(normalizeUzPhone('901234567')).toBe('+998901234567');
    expect(normalizeUzPhone('90 123 45 67')).toBe('+998901234567');
    expect(normalizeUzPhone('(90) 123-45-67')).toBe('+998901234567');
  });

  it("to'g'ri 12 xonali raqamlarni normallashtiradi", () => {
    expect(normalizeUzPhone("+998901234567")).toBe("+998901234567");
    expect(normalizeUzPhone("+998 90 123 45 67")).toBe("+998901234567");
    expect(normalizeUzPhone("998901234567")).toBe("+998901234567");
  });

  it("noto'g'ri raqamlarni rad etadi", () => {
    expect(normalizeUzPhone("")).toBeNull();
    expect(normalizeUzPhone("12345")).toBeNull();
    expect(normalizeUzPhone("abcdefgh")).toBeNull();
    expect(normalizeUzPhone("+79012345678")).toBeNull();
    expect(normalizeUzPhone("+99890123456789")).toBeNull();
  });

  it("formatUzPhone chiroyli ko'rinish beradi", () => {
    expect(formatUzPhone("+998901234567")).toBe("+998 (90) 123-45-67");
    expect(formatUzPhone("901234567")).toBe("+998 (90) 123-45-67");
    expect(formatUzPhone("invalid")).toBe("invalid");
  });
});