/**
 * O'zbekiston telefon raqamini tekshirish va +998XXXXXXXXX formatiga normallashtirish.
 * 9 xonali (masalan: 90 123 45 67) yoki 12 xonali (+998 90 123 45 67 / 998901234567) formatlarni qabul qiladi.
 */
export function normalizeUzPhone(value: string): string | null {
  if (!value || typeof value !== "string") return null;
  const input = value.trim();
  if (!/^\+?[\d\s()\-.]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");
  if (!input.startsWith("+") && digits.length === 9) {
    return `+998${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  return null;
}

export function formatUzPhone(value: string): string {
  const normalized = normalizeUzPhone(value);
  if (!normalized) return value;
  return `${normalized.slice(0, 4)} (${normalized.slice(4, 6)}) ${normalized.slice(6, 9)}-${normalized.slice(9, 11)}-${normalized.slice(11)}`;
}
