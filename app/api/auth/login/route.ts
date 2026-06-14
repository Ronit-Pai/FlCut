import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  getAdminCredentials,
  getSessionToken,
  shouldUseSecureCookie,
} from "@/src/lib/auth/session";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const admin = getAdminCredentials();

  const emailMatches = email.toLowerCase() === admin.email.toLowerCase();
  const passwordMatches = password === admin.password;

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
