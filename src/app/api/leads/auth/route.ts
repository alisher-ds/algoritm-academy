import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAdminConfigured,
  isAuthed,
  isSameOrigin,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/adminAuth";
import { clientIdentity, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/** POST /api/leads/auth — parolni tasdiqlaydi va imzolangan HttpOnly cookie o'rnatadi. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    console.error("[auth] ADMIN_PASSWORD o'rnatilmagan — production'da kirish o'chirilgan.");
    return NextResponse.json(
      { success: false, error: "Admin paneli sozlanmagan (ADMIN_PASSWORD yo'q)" },
      { status: 503 }
    );
  }

  // Brute-force himoyasi: IP bo'yicha 15 daqiqada 8 ta urinish.
  //
  // IP sarlavhasi ishonchsiz bo'lsa (proksi sozlanmagan) uni aylantirib per-IP chegarani
  // chetlab o'tish mumkin, shuning uchun global shift qo'shamiz. Global chegara faqat
  // MUVAFFAQIYATSIZ urinishlarni sanaydi (pastda), aks holda begona odam uni to'ldirib
  // haqiqiy adminni panelga kirita olmay qo'yardi.
  const { key: ip, trusted } = clientIdentity(req);
  const ipLimit = await rateLimit(`auth:${ip}`, 8, 15 * 60);
  const blocked = !ipLimit.allowed ? ipLimit : null;

  if (blocked) {
    return NextResponse.json(
      { success: false, error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(blocked.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  const password =
    body && typeof body === "object" && typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!verifyPassword(password)) {
    // Faqat noto'g'ri urinishlar global hisobga tushadi — to'g'ri parol bilan kirgan
    // admin hech qachon global chegara tufayli bloklanmaydi.
    const failCap = trusted ? null : await rateLimit("auth:global:fail", 40, 15 * 60);
    if (failCap && !failCap.allowed) {
      return NextResponse.json(
        { success: false, error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
        { status: 429, headers: { "Retry-After": String(failCap.retryAfter) } }
      );
    }
    return NextResponse.json({ success: false, error: "Parol noto'g'ri" }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, error: "Sessiya yaratib bo'lmadi" }, { status: 500 });
  }

  const res = NextResponse.json({ success: true, expiresIn: SESSION_TTL_SECONDS });
  res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions(SESSION_TTL_SECONDS));
  return res;
}

/** GET — adminlik holatini tekshirish. */
export async function GET(req: Request) {
  return NextResponse.json({ success: isAuthed(req), configured: isAdminConfigured() });
}
