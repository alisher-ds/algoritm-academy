import { NextResponse } from "next/server";
import { AUTH_COOKIE, sessionCookieOptions } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** POST /api/leads/logout — admin sessiyasini o'chiradi. */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, "", sessionCookieOptions(0));
  return res;
}
