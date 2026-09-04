// Server-side admin autentifikatsiya yordamchilari (faqat serverda ishlatiladi).
import { createHash } from "crypto";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "algoritm-admin-2026";
export const AUTH_COOKIE = "algoritm_admin";

export function tokenDigest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function isAuthed(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${AUTH_COOKIE}=${tokenDigest(ADMIN_PASSWORD)}`);
}
