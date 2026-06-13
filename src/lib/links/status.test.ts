import { describe, test, expect } from "vitest";

import {
  isScheduled,
  isExpired,
  isActive,
  getLinkStatus,
  getCountdownLabel,
} from "./status";

const NOW = new Date("2026-06-15T12:00:00Z");
const PAST = new Date("2026-06-14T12:00:00Z");
const FUTURE = new Date("2026-06-16T12:00:00Z");
const FAR_FUTURE = new Date("2026-06-20T12:00:00Z");

type LinkOverrides = {
  isDisabled?: boolean;
  goLiveAt?: Date | null;
  expiresAt?: Date | null;
};

function link(overrides: LinkOverrides = {}) {
  return { isDisabled: false, goLiveAt: null, expiresAt: null, ...overrides };
}

describe("isScheduled", () => {
  test("true  — goLiveAt is in the future", () =>
    expect(isScheduled(FUTURE, NOW)).toBe(true));
  test("false — goLiveAt is in the past", () =>
    expect(isScheduled(PAST, NOW)).toBe(false));
  test("false — goLiveAt is null", () =>
    expect(isScheduled(null, NOW)).toBe(false));
  test("false — goLiveAt equals now exactly", () =>
    expect(isScheduled(NOW, NOW)).toBe(false));
});

describe("isExpired", () => {
  test("true  — expiresAt is in the past", () =>
    expect(isExpired(PAST, NOW)).toBe(true));
  test("false — expiresAt is in the future", () =>
    expect(isExpired(FUTURE, NOW)).toBe(false));
  test("false — expiresAt is null", () =>
    expect(isExpired(null, NOW)).toBe(false));
  test("false — expiresAt equals now exactly", () =>
    expect(isExpired(NOW, NOW)).toBe(false));
});

describe("getLinkStatus", () => {
  test("ACTIVE    — plain link", () =>
    expect(getLinkStatus(link(), NOW)).toBe("ACTIVE"));
  test("SCHEDULED — goLiveAt future", () =>
    expect(getLinkStatus(link({ goLiveAt: FUTURE }), NOW)).toBe("SCHEDULED"));
  test("ACTIVE    — goLiveAt past", () =>
    expect(getLinkStatus(link({ goLiveAt: PAST }), NOW)).toBe("ACTIVE"));
  test("EXPIRED   — expiresAt past", () =>
    expect(getLinkStatus(link({ expiresAt: PAST }), NOW)).toBe("EXPIRED"));
  test("ACTIVE    — expiresAt future", () =>
    expect(getLinkStatus(link({ expiresAt: FUTURE }), NOW)).toBe("ACTIVE"));
  test("DISABLED  — isDisabled overrides all dates", () =>
    expect(
      getLinkStatus(
        link({ isDisabled: true, goLiveAt: FUTURE, expiresAt: FAR_FUTURE }),
        NOW,
      ),
    ).toBe("DISABLED"));
  test("SCHEDULED — goLiveAt future, expiresAt far", () =>
    expect(
      getLinkStatus(link({ goLiveAt: FUTURE, expiresAt: FAR_FUTURE }), NOW),
    ).toBe("SCHEDULED"));
  test("EXPIRED priority over SCHEDULED", () =>
    expect(
      getLinkStatus(link({ goLiveAt: FUTURE, expiresAt: PAST }), NOW),
    ).toBe("EXPIRED"));
  test("ACTIVE    — goLiveAt past, expiresAt future", () =>
    expect(
      getLinkStatus(link({ goLiveAt: PAST, expiresAt: FUTURE }), NOW),
    ).toBe("ACTIVE"));
});

describe("isActive", () => {
  test("true  — plain link", () => expect(isActive(link(), NOW)).toBe(true));
  test("false — scheduled", () =>
    expect(isActive(link({ goLiveAt: FUTURE }), NOW)).toBe(false));
  test("false — expired", () =>
    expect(isActive(link({ expiresAt: PAST }), NOW)).toBe(false));
  test("false — disabled", () =>
    expect(isActive(link({ isDisabled: true }), NOW)).toBe(false));
});

describe("getCountdownLabel", () => {
  test("'Starts in ...' for scheduled link", () => {
    const label = getCountdownLabel(
      link({ goLiveAt: new Date("2026-06-15T14:00:00Z") }),
      NOW,
    );
    expect(label).toMatch(/^Starts in /);
  });
  test("'Expires in ...' for active link with future expiry", () => {
    const label = getCountdownLabel(
      link({ expiresAt: new Date("2026-06-15T14:00:00Z") }),
      NOW,
    );
    expect(label).toMatch(/^Expires in /);
  });
  test("'Expired ... ago' for expired link", () => {
    const label = getCountdownLabel(link({ expiresAt: PAST }), NOW);
    expect(label).toMatch(/^Expired /);
    expect(label).toMatch(/ ago$/);
  });
  test("null — plain active link", () =>
    expect(getCountdownLabel(link(), NOW)).toBeNull());
  test("null — disabled link", () =>
    expect(getCountdownLabel(link({ isDisabled: true }), NOW)).toBeNull());
  test("null — disabled ignores goLiveAt", () =>
    expect(
      getCountdownLabel(link({ isDisabled: true, goLiveAt: FUTURE }), NOW),
    ).toBeNull());
});
