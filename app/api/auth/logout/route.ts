import { NextResponse } from "next/server";

import { SESSION_COOKIE, shouldUseSecureCookie } from "@/src/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
