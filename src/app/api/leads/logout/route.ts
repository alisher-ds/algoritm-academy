import { NextResponse } from "next/server";
import { AUTH_COOKIE, isSameOrigin, sessionCookieOptions } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** POST /api/leads/logout — admin sessiyasini xavfsiz o'chiradi. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "So'rov rad etildi" }, { status: 403 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, "", sessionCookieOptions(0));
  return res;
}
