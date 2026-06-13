import { describe, test, expect, vi, beforeEach } from "vitest";

import { getDeviceType } from "./device";
import { isUniqueClick } from "./unique-click";

describe("getDeviceType", () => {
  test("Desktop — Windows Chrome", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
      ),
    ).toBe("Desktop"));

  test("Desktop — macOS Safari", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
      ),
    ).toBe("Desktop"));

  test("Desktop — Linux Firefox", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115",
      ),
    ).toBe("Desktop"));

  test("Mobile — Android Chrome", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36",
      ),
    ).toBe("Mobile"));

  test("Mobile — iPhone Safari", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe("Mobile"));

  test("Tablet — iPad", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe("Tablet"));

  test("Tablet — generic Tablet UA", () =>
    expect(
      getDeviceType(
        "Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36",
      ),
    ).toBe("Tablet"));

  test("Unknown — empty string", () =>
    expect(getDeviceType("")).toBe("Unknown"));
  test("Unknown — null", () => expect(getDeviceType(null)).toBe("Unknown"));
  test("Unknown — undefined", () =>
    expect(getDeviceType(undefined)).toBe("Unknown"));
  test("Unknown — bot UA", () =>
    expect(
      getDeviceType("Googlebot/2.1 (+http://www.google.com/bot.html)"),
    ).toBe("Unknown"));
});


vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    clickEvent: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/src/lib/prisma";

const LINK_ID = "link-abc-123";
const IP_HASH = "aabbcc112233";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120";

describe("isUniqueClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns true when no prior click exists in 24 h", async () => {
    vi.mocked(prisma.clickEvent.findFirst).mockResolvedValue(null);
    const result = await isUniqueClick(LINK_ID, IP_HASH, USER_AGENT);
    expect(result).toBe(true);
  });

  test("returns false when a prior click exists in 24 h", async () => {
    vi.mocked(prisma.clickEvent.findFirst).mockResolvedValue({
      id: "event-1",
      linkId: LINK_ID,
      ipHash: IP_HASH,
      userAgent: USER_AGENT,
      deviceType: "Desktop",
      referrer: null,
      country: "IN",
      createdAt: new Date(),
    });
    const result = await isUniqueClick(LINK_ID, IP_HASH, USER_AGENT);
    expect(result).toBe(false);
  });

  test("returns false when ipHash is null (cannot determine uniqueness)", async () => {
    const result = await isUniqueClick(LINK_ID, null, USER_AGENT);
    expect(result).toBe(false);
    expect(prisma.clickEvent.findFirst).not.toHaveBeenCalled();
  });

  test("passes correct 24-hour window to query", async () => {
    vi.mocked(prisma.clickEvent.findFirst).mockResolvedValue(null);
    const before = Date.now();
    await isUniqueClick(LINK_ID, IP_HASH, USER_AGENT);
    const after = Date.now();

    const callArgs = vi.mocked(prisma.clickEvent.findFirst).mock.calls[0][0];
    const createdAt = callArgs?.where?.createdAt;
    const querySince =
      createdAt && typeof createdAt === "object" && "gte" in createdAt
        ? (createdAt as { gte: Date }).gte
        : null;

    expect(querySince).toBeInstanceOf(Date);
    if (!querySince) return;
    const expectedMs = 24 * 60 * 60 * 1000;
    expect(before - querySince.getTime()).toBeGreaterThanOrEqual(
      expectedMs - 100,
    );
    expect(after - querySince.getTime()).toBeLessThanOrEqual(expectedMs + 100);
  });
});
