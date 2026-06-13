import { createHash } from "crypto";
import { type ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

import { prisma } from "@/src/lib/prisma";
import { getDeviceType } from "./device";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function getIp(headersList: ReadonlyHeaders): string | null {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip");
}

function parseReferrer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
export async function trackClick(
  linkId: string,
  headersList: ReadonlyHeaders,
): Promise<void> {
  try {
    const ip         = getIp(headersList);
    const ipHash     = ip ? hashIp(ip) : null;
    const userAgent  = headersList.get("user-agent");
    const referrer   = parseReferrer(headersList.get("referer"));
    const country    = headersList.get("x-vercel-ip-country") ?? "Unknown";
    const deviceType = getDeviceType(userAgent);

    await prisma.clickEvent.create({
      data: { linkId, ipHash, userAgent, deviceType, referrer, country },
    });
  } catch (err) {
    console.error("[trackClick] failed:", err);
  }
}
