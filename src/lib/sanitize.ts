/**
 * Matnlar va CSV eksport xavfsizligi yordamchilari.
 */

/** Nazorat belgilari va ko'rinmas belgilarni tozalash (log/CSV inyeksiyasi va soxta kiritishlarga qarshi). */
export function cleanText(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * CSV katakchasini xavfsiz formatlash (OWASP Formula / DDE Injection himoyasi).
 *
 * Excel yoki Google Sheets dasturlarida quyidagi belgilar bilan boshlanuvchi matnlar
 * formula yoki tizim buyrug'i sifatida bajarilishi xavfi mavjud:
 * `=`, `+`, `-`, `@`, `\t`, `\r`, `|`, `%`
 *
 * Ularning oldiga yakka qo'shtirnoq (`'`) qo'yish orqali matn zararsizlantiriladi.
 */
export function sanitizeCsvField(value: string | undefined | null): string {
  const raw = (value ?? "").replace(/\r?\n/g, " ");
  const safe = /^[=+\-@\t\r|%]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}
