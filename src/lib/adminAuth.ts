// Server-side admin autentifikatsiya yordamchilari (faqat serverda ishlatiladi).
//
// Sessiya cookie'si: `v1.<base64url(payload)>.<base64url(hmac)>`
//  - payload: { iat, exp, jti } — muddat va bir martalik ID
//  - hmac:    HMAC-SHA256(payload, SESSION_SECRET)
//
// Shu tufayli cookie parol hash'i emas, muddati bor va SESSION_SECRET (yoki
// ADMIN_PASSWORD) o'zgartirilsa barcha sessiyalar bekor bo'ladi (revoke).

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const AUTH_COOKIE = "algoritm_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 soat

const DEV_FALLBACK_PASSWORD = "algoritm-admin-2026";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Admin paroli. Production'da ADMIN_PASSWORD majburiy. */
export function getAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD?.trim();
  if (raw) return raw;
  if (isProduction()) return null; // prod'da default parolga yo'l qo'yilmaydi
  return DEV_FALLBACK_PASSWORD;
}

/** Sessiya imzosi uchun maxfiy kalit. */
function sessionSecret(): string | null {
  const pwd = getAdminPassword();
  // Parol sozlanmagan bo'lsa (prod'da ADMIN_PASSWORD yo'q) — sessiya umuman berilmaydi.
  if (!pwd) return null;
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return `explicit:${explicit}:pwd:${pwd}`;
  // Kalit ko'rsatilmasa — paroldan hosil qilinadi (parol o'zgarsa sessiyalar bekor bo'ladi).
  return `derived:${pwd}`;
}

/** Konfiguratsiya to'g'ri o'rnatilganmi? */
export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Parollarni doimiy vaqtda solishtirish (timing attack'ga qarshi). */
export function verifyPassword(candidate: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  // Uzunlik farqini ham yashirish uchun hash'lab solishtiramiz.
  const h = (v: string) => createHmac("sha256", "pwd-compare").update(v).digest("hex");
  return safeEqual(h(candidate), h(expected));
}

export interface SessionPayload {
  iat: number;
  exp: number;
  jti: string;
}

/** Yangi imzolangan sessiya tokeni. */
export function createSessionToken(ttlSeconds = SESSION_TTL_SECONDS): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + ttlSeconds,
    jti: randomBytes(12).toString("hex"),
  };
  const body = b64url(JSON.stringify(payload));
  return `v1.${body}.${sign(body, secret)}`;
}

/** Tokenni tekshiradi: format + imzo + muddat. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = sessionSecret();
  if (!secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const [, body, sig] = parts;
  if (!safeEqual(sig, sign(body, secret))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Cookie sarlavhasidan berilgan nomdagi cookie qiymatini oladi. */
export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return undefined;
}

export function isAuthed(req: Request): boolean {
  return verifySessionToken(readCookie(req.headers.get("cookie"), AUTH_COOKIE));
}

/** Cookie parametrlari (production'da Secure). */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "strict" as const,
    secure: isProduction(),
    path: "/",
    maxAge,
  };
}

/**
 * CSRF himoyasi: o'zgartiruvchi so'rovlar uchun Origin/Referer sayt bilan mos bo'lishi shart.
 * Sarlavha umuman bo'lmasa (masalan curl/server-to-server) — o'tkazamiz, chunki cookie
 * SameSite=Strict bilan brauzerdan cross-site yuborilmaydi.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin || referer;
  if (!source) return true;
  try {
    const src = new URL(source);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (!host) return true;
    return src.host === host;
  } catch {
    return false;
  }
}
