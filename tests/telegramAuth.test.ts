import { describe, expect, it } from "vitest";
import { verifyTelegramWebAppData } from "../src/lib/telegramAuth";
import { createHmac } from "crypto";

describe("Telegram WebApp HMAC-SHA256 Security Validator", () => {
  const mockToken = "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ";

  function generateValidInitData(params: Record<string, string>, token: string) {
    const keys = Object.keys(params).sort();
    const dataCheckString = keys.map((k) => `${k}=${params[k]}`).join("\n");
    const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
    const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    const qs = new URLSearchParams(params);
    qs.set("hash", hash);
    return qs.toString();
  }

  it("haqiqiy Telegram imzolangan initData ni muvaffaqiyatli tasdiqlaydi", () => {
    const now = Math.floor(Date.now() / 1000);
    const rawData = generateValidInitData(
      {
        auth_date: String(now),
        query_id: "AAGX998",
        user: JSON.stringify({ id: 987654321, first_name: "Aziz", username: "aziz_math" }),
      },
      mockToken
    );

    const result = verifyTelegramWebAppData(rawData, mockToken);
    expect(result.valid).toBe(true);
    expect(result.user?.id).toBe(987654321);
    expect(result.user?.first_name).toBe("Aziz");
  });

  it("soxtalashtirilgan (o'zgartirilgan) ma'lumotni rad etadi", () => {
    const now = Math.floor(Date.now() / 1000);
    const rawData = generateValidInitData(
      {
        auth_date: String(now),
        user: JSON.stringify({ id: 987654321, first_name: "Aziz" }),
      },
      mockToken
    );

    // Xaker user ID sini o'zgartirib yuborsa:
    const tampered = rawData.replace("987654321", "111111111");
    const result = verifyTelegramWebAppData(tampered, mockToken);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Imzo");
  });

  it("noto'g'ri token bilan tekshirilganda rad etadi", () => {
    const now = Math.floor(Date.now() / 1000);
    const rawData = generateValidInitData(
      { auth_date: String(now), user: JSON.stringify({ id: 123 }) },
      mockToken
    );

    const result = verifyTelegramWebAppData(rawData, "wrong-token-999");
    expect(result.valid).toBe(false);
  });
});
