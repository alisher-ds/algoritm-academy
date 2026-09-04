import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 2) return `+998 (${digits}`;
  if (digits.length <= 4) return `+998 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5)}`;
  if (digits.length <= 9) return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
  return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
}
