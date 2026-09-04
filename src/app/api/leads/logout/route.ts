import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/adminAuth";

/** POST /api/leads/logout — admin cookie'sini o'chiradi. */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
