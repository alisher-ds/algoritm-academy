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
  // Vaqti o'tgan yozuvlarni tozalash (xotira o'smasligi uchun)
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
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

/** So'rov manbasi (IP) ni proxy sarlavhalaridan aniqlash. */
export function clientIp(req: Request): string {
  const candidates = [
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const c of candidates) {
    const v = c?.trim();
    if (v) return v;
  }
  return "local";
}
