import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, AUTH_COOKIE, isAuthed, tokenDigest } from "@/lib/adminAuth";

/** POST /api/leads/auth — parolni tasdiqlaydi va HttpOnly cookie o'rnatadi. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password =
    body && typeof body === "object" && typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Parol noto'g'ri" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, tokenDigest(ADMIN_PASSWORD), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 kun
  });
  return res;
}

/** GET — adminlik holatini tekshirish. */
export async function GET(req: Request) {
  return NextResponse.json({ success: isAuthed(req) });
}
