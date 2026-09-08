import { createHmac, timingSafeEqual } from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidationResult {
  valid: boolean;
  user?: TelegramUser;
  authDate?: number;
  error?: string;
}

/**
 * Telegram WebApp initData ni rasmiy kriptografik standart (HMAC-SHA256) bo'yicha tekshirish.
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppData(
  rawInitData: string | undefined | null,
  botToken: string | undefined | null
): ValidationResult {
  if (!rawInitData || !botToken) {
    return { valid: false, error: "initData yoki botToken kiritilmadi" };
  }

  try {
    const params = new URLSearchParams(rawInitData);
    const hash = params.get("hash");
    if (!hash) {
      return { valid: false, error: "Hash maydoni topilmadi" };
    }

    // 1. Hash dan boshqa barcha parametrlarni alifbo bo'yicha saralash
    const dataCheckArr: string[] = [];
    const keys = Array.from(params.keys())
      .filter((k) => k !== "hash")
      .sort();

    for (const key of keys) {
      dataCheckArr.push(`${key}=${params.get(key)}`);
    }
    const dataCheckString = dataCheckArr.join("\n");

    // 2. Secret Key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();

    // 3. Calculated Hash = HMAC_SHA256(dataCheckString, secretKey)
    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // 4. Doimiy vaqtda (timing attack ga qarshi) solishtirish
    const hashBuf = Buffer.from(hash, "utf-8");
    const calcBuf = Buffer.from(calculatedHash, "utf-8");
    if (hashBuf.length !== calcBuf.length || !timingSafeEqual(hashBuf, calcBuf)) {
      return { valid: false, error: "Imzo (hash) mos kelmadi. Soxtalashtirilgan so'rov." };
    }

    // 5. Muddati o'tganligini tekshirish (24 soat)
    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);
    if (authDate && now - authDate > 86400 * 2) {
      return { valid: false, error: "Sessiya muddati o'tgan. Iltimos botni qayta oching." };
    }

    // 6. User ma'lumotlarini parse qilish
    let user: TelegramUser | undefined;
    const rawUser = params.get("user");
    if (rawUser) {
      try {
        user = JSON.parse(rawUser);
      } catch {}
    }

    return {
      valid: true,
      user,
      authDate,
    };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
