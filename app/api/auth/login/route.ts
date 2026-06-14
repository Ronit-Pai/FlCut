import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  getAdminCredentials,
  isValidAdminCredentials,
  shouldUseSecureCookie,
} from "@/src/lib/auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<
  string,
  { count: number; firstAttemptAt: number }
>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function getRateLimitRecord(key: string) {
  const record = loginAttempts.get(key);
  if (!record) {
    return { count: 0, firstAttemptAt: Date.now() };
  }

  const expired = Date.now() - record.firstAttemptAt > LOGIN_WINDOW_MS;
  if (expired) {
    loginAttempts.delete(key);
    return { count: 0, firstAttemptAt: Date.now() };
  }

  return record;
}

function incrementRateLimit(key: string) {
  const record = getRateLimitRecord(key);
  record.count += 1;
  loginAttempts.set(key, record);
}

function isRateLimited(key: string): boolean {
  const record = getRateLimitRecord(key);
  return record.count >= MAX_LOGIN_ATTEMPTS;
}

export async function POST(request: Request): Promise<NextResponse> {
  const rateLimitKey = getClientIp(request);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { success: false, error: "Too many login attempts. Try again later." },
      { status: 429 },
    );
  }

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

  if (!isValidAdminCredentials(email, password, admin)) {
    incrementRateLimit(rateLimitKey);
    return NextResponse.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 },
    );
  }

  loginAttempts.delete(rateLimitKey);
  const token = await createSessionToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
