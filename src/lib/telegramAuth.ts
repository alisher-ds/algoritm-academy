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

    // 5. `auth_date` is mandatory. Accepting a missing/NaN date turns a
    // signed but replayable payload into a permanent login token.
    const rawAuthDate = params.get("auth_date");
    const authDate = rawAuthDate ? Number(rawAuthDate) : NaN;
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 86400 * 2;
    if (!Number.isSafeInteger(authDate) || authDate <= 0 || authDate > now + 60 || now - authDate > maxAge) {
      return { valid: false, error: "Telegram sessiyasi yaroqsiz yoki muddati o'tgan. Iltimos botni qayta oching." };
    }

    // 6. User ma'lumotlarini parse qilish va minimal shaklini tekshirish
    let user: TelegramUser | undefined;
    const rawUser = params.get("user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as Partial<TelegramUser>;
        if (typeof parsed.id === "number" && Number.isSafeInteger(parsed.id) && parsed.id > 0) {
          user = {
            id: parsed.id,
            first_name: typeof parsed.first_name === "string" ? parsed.first_name : "Telegram user",
            last_name: typeof parsed.last_name === "string" ? parsed.last_name : undefined,
            username: typeof parsed.username === "string" ? parsed.username : undefined,
            language_code: typeof parsed.language_code === "string" ? parsed.language_code : undefined,
          };
        }
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
