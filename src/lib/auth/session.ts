export const SESSION_COOKIE = "flcut_session";

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin";
const DEFAULT_AUTH_SECRET = "flcut-local-session";

export type AdminCredentials = {
  email: string;
  password: string;
};

export function getAdminCredentials(): AdminCredentials {
  return {
    email: process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  };
}

export function getSessionToken(): string {
  return process.env.AUTH_SECRET?.trim() || DEFAULT_AUTH_SECRET;
}

export function isValidSession(value: string | undefined): boolean {
  return value === getSessionToken();
}

export function shouldUseSecureCookie(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}
