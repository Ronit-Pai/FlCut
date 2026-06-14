import crypto from "crypto";
import { jwtVerify, SignJWT } from "jose";

import { ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET } from "@/src/lib/env";

export const SESSION_COOKIE = "flcut_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = {
  user: "admin";
  iat: number;
  exp: number;
};

export type AdminCredentials = {
  email: string;
  password: string;
};

export function getAdminCredentials(): AdminCredentials {
  return {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  };
}

function toUint8Array(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = toUint8Array(left);
  const rightBytes = toUint8Array(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBytes, rightBytes);
}

export function isValidAdminCredentials(
  email: string,
  password: string,
  credentials: AdminCredentials,
): boolean {
  const emailMatches = email.toLowerCase() === credentials.email.toLowerCase();
  const passwordMatches = timingSafeEqual(password, credentials.password);
  return emailMatches && passwordMatches;
}

export async function createSessionToken(): Promise<string> {
  const token = await new SignJWT({ user: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(toUint8Array(AUTH_SECRET));

  return token;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | false> {
  try {
    const { payload } = await jwtVerify(token, toUint8Array(AUTH_SECRET), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.user !== "string" ||
      payload.user !== "admin" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return false;
    }

    return payload as SessionPayload;
  } catch {
    return false;
  }
}

export async function getSessionUser(token: string): Promise<string | null> {
  const payload = await verifySessionToken(token);
  return payload ? payload.user : null;
}

export function shouldUseSecureCookie(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}
