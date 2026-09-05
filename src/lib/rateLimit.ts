// Oddiy rate-limit.
//
// Agar Upstash Redis o'rnatilgan bo'lsa — barcha instansiyalar uchun umumiy (atomik INCR+EXPIRE).
// Aks holda in-memory (bitta jarayon doirasida) — lokal/VPS uchun yetarli.

type Result = { allowed: boolean; remaining: number; retryAfter: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function upstash(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisPipeline(commands: (string | number)[][]): Promise<{ result: unknown }[]> {
  const cfg = upstash()!;
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash rate-limit xatosi (${res.status})`);
  return (await res.json()) as { result: unknown }[];
}

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  // Vaqti o'tgan yozuvlarni tozalash (xotira cheksiz o'smasligi uchun)
  if (memory.size > 2000) {
    for (const [k, v] of memory) {
      if (v.resetAt <= now) memory.delete(k);
    }
    // Agar faol flood hujumi bo'lsa, eng eski yozuvlarni FIFO tarzida chiqarib tashlash
    if (memory.size > 2500) {
      const keysToDelete = Array.from(memory.keys()).slice(0, 1000);
      for (const k of keysToDelete) memory.delete(k);
    }
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<Result> {
  if (!upstash()) return memoryLimit(key, limit, windowSeconds * 1000);
  try {
    const redisKey = `rl:${key}`;
    const [incr] = await redisPipeline([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, windowSeconds, "NX"],
    ]);
    const count = Number(incr.result ?? 0);
    if (count > limit) return { allowed: false, remaining: 0, retryAfter: windowSeconds };
    return { allowed: true, remaining: limit - count, retryAfter: 0 };
  } catch (err) {
    console.error("[rateLimit] Redis xatosi, in-memory rejimga o'tildi:", err);
    return memoryLimit(key, limit, windowSeconds * 1000);
  }
}

const IP_RE = /^[\da-fA-F.:]{3,45}$/;

/**
 * Proksi sarlavhalari (`x-forwarded-for` va h.k.) mijoz tomonidan yoziladi — ular
 * platforma tomonidan qayta yozilmasa, ularga ishonish rate-limit'ni ma'nosiz qiladi
 * (istalgan bot sarlavhani aylantirib cheksiz so'rov yuboradi).
 *
 * Shuning uchun sarlavhaga faqat quyidagi hollarda ishonamiz:
 *  1. `TRUSTED_IP_HEADER` aniq ko'rsatilgan (nginx/Cloudflare orqasida — o'zingiz sozlaysiz), yoki
 *  2. Platforma o'zi majburan yozadigan sarlavha aniqlandi (Vercel: `x-vercel-forwarded-for`).
 *
 * Aks holda `trusted: false` qaytadi va chaqiruvchi qo'shimcha global chegara qo'yishi kerak.
 */
export interface ClientIdentity {
  /** Rate-limit kaliti sifatida ishlatiladigan qiymat. */
  key: string;
  /** Qiymat ishonchli manbadanmi (ya'ni mijoz uni o'zgartira olmaydimi)? */
  trusted: boolean;
}

function headerIp(req: Request, name: string): string | null {
  const raw = req.headers.get(name)?.split(",")[0]?.trim();
  return raw && IP_RE.test(raw) ? raw : null;
}

export function clientIdentity(req: Request): ClientIdentity {
  // 1. Aniq ko'rsatilgan ishonchli sarlavha (deploy egasi o'zi tasdiqlaydi).
  const trustedHeader = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trustedHeader) {
    const ip = headerIp(req, trustedHeader);
    if (ip) return { key: ip, trusted: true };
    // Sarlavha kutilgan, lekin kelmadi — proksi noto'g'ri sozlangan. Ishonmaymiz.
    return { key: "unknown", trusted: false };
  }

  // 2. Vercel `x-vercel-forwarded-for` ni har so'rovda o'zi qayta yozadi — soxtalashtirib bo'lmaydi.
  if (process.env.VERCEL) {
    const ip = headerIp(req, "x-vercel-forwarded-for");
    if (ip) return { key: ip, trusted: true };
  }

  // 3. Boshqa hollarda sarlavhalar mijoz nazoratida. Ularni faqat "yumshoq" ajratish
  //    uchun ishlatamiz (halol foydalanuvchilar bir-birini bloklamasligi uchun),
  //    lekin ishonchli deb belgilamaymiz — chaqiruvchi global chegara qo'shadi.
  const soft =
    headerIp(req, "cf-connecting-ip") ||
    headerIp(req, "x-real-ip") ||
    headerIp(req, "x-forwarded-for");

  return { key: soft ?? "local", trusted: false };
}

/** Eski/qulay shakl — faqat kalitni qaytaradi. Ishonchlilik kerak bo'lsa `clientIdentity()`. */
export function clientIp(req: Request): string {
  return clientIdentity(req).key;
}
