import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";
export type LinkWithCounts = Prisma.LinkGetPayload<{
  include: { _count: { select: { clickEvents: true } } };
}>;

export type DashboardStats = {
  totalLinks:     number;
  totalClicks:    number;
  uniqueVisitors: number;
};

export type ReferrerStat  = { source: string;  count: number };
export type CountryStat   = { country: string; count: number };
export type DeviceStat    = { type: string;    count: number; percentage: number };
export type TimeSeriesPoint = { date: string;  clicks: number };

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalLinks, totalClicks, uniqueGroups] = await Promise.all([
    prisma.link.count(),
    prisma.clickEvent.count(),
    prisma.clickEvent.groupBy({
      by: ["ipHash", "userAgent"],
      where: { ipHash: { not: null } },
    }),
  ]);

  return { totalLinks, totalClicks, uniqueVisitors: uniqueGroups.length };
}

export async function getLinksWithCounts(): Promise<LinkWithCounts[]> {
  return prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clickEvents: true } } },
  });
}
export async function getUniqueClicksByLinkId(): Promise<Record<string, number>> {
  const groups = await prisma.clickEvent.groupBy({
    by: ["linkId", "ipHash"],
    where: { ipHash: { not: null } },
  });

  const result: Record<string, number> = {};
  for (const { linkId } of groups) {
    result[linkId] = (result[linkId] ?? 0) + 1;
  }
  return result;
}

function linkWhere(linkId?: string): Prisma.ClickEventWhereInput {
  return linkId ? { linkId } : {};
}

export async function getTopReferrers(
  limit = 8,
  linkId?: string,
): Promise<ReferrerStat[]> {
  const groups = await prisma.clickEvent.groupBy({
    by: ["referrer"],
    where: linkWhere(linkId),
    _count: { _all: true },
    orderBy: { _count: { referrer: "desc" } },
    take: limit,
  });

  return groups.map((g) => ({
    source: g.referrer ?? "Direct",
    count: g._count._all,
  }));
}

export async function getTopCountries(limit = 8): Promise<CountryStat[]> {
  const groups = await prisma.clickEvent.groupBy({
    by: ["country"],
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: limit,
  });

  return groups.map((g) => ({
    country: g.country ?? "Unknown",
    count:   g._count.country,
  }));
}

export async function getDeviceBreakdown(linkId?: string): Promise<DeviceStat[]> {
  const groups = await prisma.clickEvent.groupBy({
    by: ["deviceType"],
    where: linkWhere(linkId),
    _count: { _all: true },
    orderBy: { _count: { deviceType: "desc" } },
  });

  const total = groups.reduce((s, g) => s + g._count._all, 0);

  return groups.map((g) => ({
    type:       g.deviceType ?? "Unknown",
    count:      g._count._all,
    percentage: total > 0 ? Math.round((g._count._all / total) * 100) : 0,
  }));
}

export async function getClicksTimeSeries(
  days = 7,
  linkId?: string,
): Promise<TimeSeriesPoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const clicks = await prisma.clickEvent.findMany({
    where: { ...linkWhere(linkId), createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const fmt = new Intl.DateTimeFormat("en-IN", {
    day:      "2-digit",
    month:    "short",
    timeZone: "Asia/Kolkata",
  });

  const byDay: Record<string, number> = {};
  for (const c of clicks) {
    const day = fmt.format(c.createdAt);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return Object.entries(byDay).map(([date, clicks]) => ({ date, clicks }));
}
