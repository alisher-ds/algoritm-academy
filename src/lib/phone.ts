/**
 * O'zbekiston telefon raqamini tekshirish va +998XXXXXXXXX formatiga normallashtirish.
 * 9 xonali (masalan: 90 123 45 67) yoki 12 xonali (+998 90 123 45 67 / 998901234567) formatlarni qabul qiladi.
 */
/**
 * O'zbekistonda amaldagi operator/hudud kodlari.
 * Bularsiz `000000000` kabi aniq soxta raqamlar bazaga tushib ketardi.
 */
const UZ_AREA_CODES =
  /^(33|50|55|61|62|65|66|67|69|70|71|72|73|74|75|76|77|78|79|88|90|91|93|94|95|97|98|99)/;

export function normalizeUzPhone(value: string): string | null {
  if (!value || typeof value !== "string") return null;
  const input = value.trim();
  if (!/^\+?[\d\s()\-.]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");

  let local: string | null = null;
  if (!input.startsWith("+") && digits.length === 9) local = digits;
  else if (digits.length === 12 && digits.startsWith("998")) local = digits.slice(3);
  if (!local) return null;

  if (!UZ_AREA_CODES.test(local)) return null;
  return `+998${local}`;
}

export function formatUzPhone(value: string): string {
  const normalized = normalizeUzPhone(value);
  if (!normalized) return value;
  return `${normalized.slice(0, 4)} (${normalized.slice(4, 6)}) ${normalized.slice(6, 9)}-${normalized.slice(9, 11)}-${normalized.slice(11)}`;
}
