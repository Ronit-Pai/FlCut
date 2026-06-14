const AUTH_SECRET_MIN_LENGTH = 32;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export const AUTH_SECRET = getRequiredEnv("AUTH_SECRET");
export const ADMIN_EMAIL = getRequiredEnv("ADMIN_EMAIL");
export const ADMIN_PASSWORD = getRequiredEnv("ADMIN_PASSWORD");
export const DATABASE_URL = getRequiredEnv("DATABASE_URL");

if (AUTH_SECRET.length < AUTH_SECRET_MIN_LENGTH) {
  throw new Error(
    `AUTH_SECRET must be at least ${AUTH_SECRET_MIN_LENGTH} characters long`,
  );
}

export function getBaseUrl(): string {
  const configured = process.env.BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
