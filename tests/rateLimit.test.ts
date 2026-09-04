import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, rateLimit } from "../src/lib/rateLimit";

describe("rateLimit (in-memory)", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("limitgacha ruxsat beradi, keyin bloklaydi", async () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect((await rateLimit(key, 3, 60)).allowed).toBe(true);
    }
    const blocked = await rateLimit(key, 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("oyna tugagach qayta tiklanadi", async () => {
    const key = `test-${Math.random()}`;
    expect((await rateLimit(key, 1, 1)).allowed).toBe(true);
    expect((await rateLimit(key, 1, 1)).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 1100));
    expect((await rateLimit(key, 1, 1)).allowed).toBe(true);
  });

  it("kalitlar bir-biridan mustaqil", async () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    await rateLimit(a, 1, 60);
    expect((await rateLimit(a, 1, 60)).allowed).toBe(false);
    expect((await rateLimit(b, 1, 60)).allowed).toBe(true);
  });

  it("clientIp proxy sarlavhalaridan IP oladi", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "1.2.3.4" } }))).toBe("1.2.3.4");
    expect(
      clientIp(new Request("http://x", { headers: { "x-forwarded-for": "5.6.7.8, 9.9.9.9" } }))
    ).toBe("5.6.7.8");
    expect(clientIp(new Request("http://x"))).toBe("local");
  });
});
