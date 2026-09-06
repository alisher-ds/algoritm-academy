import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshAuth() {
  vi.resetModules();
  return import("../src/lib/adminAuth");
}

describe("adminAuth", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-parol-123";
    process.env.ADMIN_SESSION_SECRET = "0123456789abcdef";
    vi.unstubAllEnvs();
  });

  it("to'g'ri parolni tasdiqlaydi, noto'g'risini rad etadi", async () => {
    const a = await freshAuth();
    expect(a.verifyPassword("test-parol-123")).toBe(true);
    expect(a.verifyPassword("boshqa")).toBe(false);
    expect(a.verifyPassword("")).toBe(false);
  });

  it("imzolangan sessiya tokeni yaratadi va tekshiradi", async () => {
    const a = await freshAuth();
    const token = a.createSessionToken();
    expect(token).toBeTruthy();
    expect(a.verifySessionToken(token!)).toBe(true);
  });

  it("buzilgan imzoni rad etadi", async () => {
    const a = await freshAuth();
    const token = a.createSessionToken()!;
    const parts = token.split(".");
    expect(a.verifySessionToken(`${parts[0]}.${parts[1]}.buzilgan`)).toBe(false);
    expect(a.verifySessionToken("random")).toBe(false);
    expect(a.verifySessionToken(undefined)).toBe(false);
  });

  it("muddati o'tgan tokenni rad etadi", async () => {
    const a = await freshAuth();
    const expired = a.createSessionToken(-10);
    expect(a.verifySessionToken(expired!)).toBe(false);
  });

  it("boshqa maxfiy kalit bilan imzolangan tokenni rad etadi", async () => {
    const a1 = await freshAuth();
    const token = a1.createSessionToken()!;
    process.env.ADMIN_SESSION_SECRET = "boshqa-kalit";
    const a2 = await freshAuth();
    expect(a2.verifySessionToken(token)).toBe(false);
  });

  it("ADMIN_PASSWORD o'zgarganda ADMIN_SESSION_SECRET o'rnatilgan bo'lsa ham sessiya bekor bo'ladi", async () => {
    process.env.ADMIN_PASSWORD = "eski-parol";
    process.env.ADMIN_SESSION_SECRET = "doimiy-secret";
    const a1 = await freshAuth();
    const token = a1.createSessionToken()!;
    expect(a1.verifySessionToken(token)).toBe(true);

    process.env.ADMIN_PASSWORD = "yangi-parol";
    const a2 = await freshAuth();
    expect(a2.verifySessionToken(token)).toBe(false);
  });

  it("cookie'ni to'g'ri o'qiydi", async () => {
    const a = await freshAuth();
    expect(a.readCookie("a=1; algoritm_admin=abc; b=2", "algoritm_admin")).toBe("abc");
    expect(a.readCookie(null, "algoritm_admin")).toBeUndefined();
    expect(a.readCookie("other=1", "algoritm_admin")).toBeUndefined();
  });

  it("isAuthed haqiqiy cookie bilan ishlaydi", async () => {
    const a = await freshAuth();
    const token = a.createSessionToken()!;
    const req = new Request("http://x/api", {
      headers: { cookie: `${a.AUTH_COOKIE}=${token}` },
    });
    expect(a.isAuthed(req)).toBe(true);
    expect(a.isAuthed(new Request("http://x/api"))).toBe(false);
  });

  it("production'da ADMIN_PASSWORD bo'lmasa sozlanmagan hisoblanadi", async () => {
    delete process.env.ADMIN_PASSWORD;
    vi.stubEnv("NODE_ENV", "production");
    const a = await freshAuth();
    expect(a.isAdminConfigured()).toBe(false);
    expect(a.createSessionToken()).toBeNull();
    vi.unstubAllEnvs();
  });

  it("cross-origin so'rovni aniqlaydi", async () => {
    const a = await freshAuth();
    const same = new Request("http://site.uz/api", {
      headers: { host: "site.uz", origin: "http://site.uz" },
    });
    const cross = new Request("http://site.uz/api", {
      headers: { host: "site.uz", origin: "http://yovuz.uz" },
    });
    expect(a.isSameOrigin(same)).toBe(true);
    expect(a.isSameOrigin(cross)).toBe(false);
    expect(a.isSameOrigin(new Request("http://site.uz/api"))).toBe(true);
  });

  it("production'da cookie Secure bo'ladi", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const a = await freshAuth();
    expect(a.sessionCookieOptions(60).secure).toBe(true);
    expect(a.sessionCookieOptions(60).sameSite).toBe("lax");
    expect(a.sessionCookieOptions(60).httpOnly).toBe(true);
    vi.unstubAllEnvs();
  });

  it("HTTP so'rovda (lokal IP yoki LAN) cookie secure bo'lmaydi (mobil brauzerlar rad etmasligi uchun)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const a = await freshAuth();
    const req = new Request("http://10.78.193.76:3000/api/leads/auth");
    expect(a.sessionCookieOptions(60, req).secure).toBe(false);
    expect(a.sessionCookieOptions(60, req).sameSite).toBe("lax");
    vi.unstubAllEnvs();
  });

  it("maxAge ko'rsatilmaganda haqiqiy session cookie (maxAge yo'q) hosil qiladi", async () => {
    const a = await freshAuth();
    const opts = a.sessionCookieOptions();
    expect(opts.maxAge).toBeUndefined();
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
  });
});
