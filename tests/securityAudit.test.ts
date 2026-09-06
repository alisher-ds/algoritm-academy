import { describe, expect, it } from "vitest";
import { decryptStorage, encryptStorage } from "../src/lib/leads";
import nextConfig from "../next.config";

describe("Security Audit Verifications", () => {
  describe("LocalStorage Encryption", () => {
    it("ma'lumotlarni ochiq matn (plaintext) qoldirmasdan shifrlaydi (enc:v1: prefiksi bilan)", () => {
      const sensitiveData = [
        { name: "Sardor O'ktamov", phone: "+998 90 123 45 67", targetInterest: "Digital SAT" },
      ];
      const encrypted = encryptStorage(sensitiveData);

      expect(encrypted).toMatch(/^enc:v1:/);
      expect(encrypted).not.toContain("+998 90 123 45 67");
      expect(encrypted).not.toContain("Sardor O'ktamov");

      const decrypted = decryptStorage<typeof sensitiveData>(encrypted);
      expect(decrypted).toEqual(sensitiveData);
    });

    it("o'zbekcha maxsus harflar (o', g', sh, ch) bilan xatosiz ishlaydi", () => {
      const data = { notes: "To'lqin G'ulomov bilan bog'lanildi, sinov darsi" };
      const enc = encryptStorage(data);
      const dec = decryptStorage<typeof data>(enc);
      expect(dec).toEqual(data);
    });

    it("eski shifrlanmagan (plain JSON) ma'lumotlar bilan orqaga mos (backward compatible)", () => {
      const legacyRaw = JSON.stringify([{ id: "1", name: "Eski Foydalanuvchi" }]);
      const parsed = decryptStorage<Array<{ id: string; name: string }>>(legacyRaw);
      expect(parsed).toEqual([{ id: "1", name: "Eski Foydalanuvchi" }]);
    });

    it("buzilgan yoki null qiymatlarda null qaytaradi", () => {
      expect(decryptStorage(null)).toBeNull();
      expect(decryptStorage("enc:v1:not-valid-base64-!@#$%")).toBeNull();
    });
  });

  describe("CSP (Content Security Policy) Headers", () => {
    it("next.config.ts da Content-Security-Policy sarlavhasi sozlangan", async () => {
      if (typeof nextConfig.headers !== "function") {
        throw new Error("headers funksiyasi topilmadi");
      }
      const headersList = await nextConfig.headers();
      const rootRule = headersList.find((h) => h.source === "/:path*");
      expect(rootRule).toBeDefined();

      const cspHeader = rootRule?.headers.find((h) => h.key === "Content-Security-Policy");
      expect(cspHeader).toBeDefined();
      expect(cspHeader?.value).toContain("default-src 'self'");
      expect(cspHeader?.value).toContain("frame-ancestors 'self'");
    });

    it("X-Content-Type-Options va X-Frame-Options himoyalari sozlangan", async () => {
      const headersList = await nextConfig.headers!();
      const rootRule = headersList.find((h) => h.source === "/:path*");

      const nosniff = rootRule?.headers.find((h) => h.key === "X-Content-Type-Options");
      expect(nosniff?.value).toBe("nosniff");

      const frameOptions = rootRule?.headers.find((h) => h.key === "X-Frame-Options");
      expect(frameOptions?.value).toBe("SAMEORIGIN");
    });
  });

  describe("GET /api/leads/auth Rate Limiting", () => {
    it("GET /api/leads/auth ketma-ket so'rovlarda rate limit (429) beradi", async () => {
      const { GET } = await import("../src/app/api/leads/auth/route");
      const ip = "198.51.100.42";
      let blocked = false;

      for (let i = 0; i < 130; i++) {
        const req = new Request("http://site.uz/api/leads/auth", {
          method: "GET",
          headers: {
            host: "site.uz",
            "x-real-ip": ip,
          },
        });
        const res = await GET(req);
        if (res.status === 429) {
          blocked = true;
          const data = await res.json();
          expect(data.success).toBe(false);
          expect(res.headers.get("retry-after")).toBeDefined();
          break;
        }
      }

      expect(blocked).toBe(true);
    });
  });
});
