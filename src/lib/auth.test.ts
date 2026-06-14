import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";

import {
  createSessionToken,
  getAdminCredentials,
  getSessionUser,
  isValidAdminCredentials,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/src/lib/auth";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { proxy } from "@/proxy";

const TEST_URL = "https://localhost/api/auth/login";

const makeNextRequest = (url: string, cookie?: string) => {
  return {
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => ({ value: cookie }),
    },
    headers: new Headers({ "x-forwarded-for": "127.0.0.1" }),
    url,
  } as unknown as Request;
};

describe("auth utilities", () => {
  it("creates and verifies a valid session token", async () => {
    const token = await createSessionToken();
    const payload = await verifySessionToken(token);

    expect(payload).not.toBe(false);
    if (payload !== false) {
      expect(payload.user).toBe("admin");
      expect(typeof payload.iat).toBe("number");
      expect(typeof payload.exp).toBe("number");
    }
  });

  it("returns the admin user from a valid token", async () => {
    const token = await createSessionToken();
    const user = await getSessionUser(token);
    expect(user).toBe("admin");
  });

  it("rejects forged tokens", async () => {
    const payload = { user: "admin", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 };
    const key = new TextEncoder().encode("wrong-secret-value-that-is-not-auth-secret");
    const forgedToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(key);

    expect(await verifySessionToken(forgedToken)).toBe(false);
    expect(await getSessionUser(forgedToken)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await new SignJWT({ user: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1ms")
      .sign(new TextEncoder().encode(process.env.AUTH_SECRET || ""));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(await verifySessionToken(token)).toBe(false);
  });

  it("validates correct admin credentials and rejects invalid ones", () => {
    const admin = getAdminCredentials();
    expect(isValidAdminCredentials(admin.email, admin.password, admin)).toBe(true);
    expect(isValidAdminCredentials("wrong@example.com", admin.password, admin)).toBe(false);
    expect(isValidAdminCredentials(admin.email, "wrong-password", admin)).toBe(false);
  });
});

describe("auth routes", () => {
  it("logs in with valid credentials and sets a session cookie", async () => {
    const admin = getAdminCredentials();
    const request = new Request(TEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email, password: admin.password }),
    });

    const response = await loginPOST(request as Request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  it("rejects invalid login credentials", async () => {
    const request = new Request(TEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad@example.com", password: "bad" }),
    });

    const response = await loginPOST(request as Request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("clears the session cookie on logout", async () => {
    const request = new Request("https://localhost/api/auth/logout", {
      method: "POST",
    });
    const response = await logoutPOST(request as Request);
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie).toContain("Max-Age=0");
  });

  it("blocks access when the session cookie is invalid", async () => {
    const response = await proxy(
      makeNextRequest("https://localhost/dashboard", "invalid-token") as any,
    );
    expect(response.status).toBe(302);
  });

  it("allows access when the session cookie is valid", async () => {
    const token = await createSessionToken();
    const response = await proxy(
      makeNextRequest("https://localhost/dashboard", token) as any,
    );
    expect(response.status).toBe(200);
  });
});
