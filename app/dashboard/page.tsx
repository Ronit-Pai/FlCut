import Link from "next/link";
import type { Metadata } from "next";

import { getBaseUrl } from "@/src/lib/env";
import { getLinkStatus } from "@/src/lib/links/status";
import type { ComputedStatus } from "@/src/lib/links/status";
import {
  getDashboardStats,
  getLinksWithCounts,
  getUniqueClicksByLinkId,
  getTopReferrers,
  getDeviceBreakdown,
  getClicksTimeSeries,
} from "@/src/lib/analytics/queries";
import { LinksTable } from "@/components/dashboard/links-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnalyticsSection } from "@/components/dashboard/analytics-section";

export const metadata: Metadata = {
  title: "Dashboard — FLCut",
  description: "All shortened links created with FLCut.",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Expired", value: "expired" },
  { label: "Disabled", value: "disabled" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function isValidFilter(v: string): v is FilterValue {
  return FILTERS.some((f) => f.value === v);
}

const EMPTY_MESSAGES: Record<FilterValue, string> = {
  all: "No links created yet.",
  active: "No active links.",
  scheduled: "No scheduled links.",
  expired: "No expired links.",
  disabled: "No disabled links.",
};

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { filter: rawFilter = "all" } = await searchParams;
  const filter: FilterValue = isValidFilter(rawFilter) ? rawFilter : "all";

  const [
    allLinks,
    stats,
    uniqueClicksByLinkId,
    topReferrers,
    deviceBreakdown,
    timeSeries,
  ] = await Promise.all([
    getLinksWithCounts(),
    getDashboardStats(),
    getUniqueClicksByLinkId(),
    getTopReferrers(),
    getDeviceBreakdown(),
    getClicksTimeSeries(7),
  ]);

  const now = new Date();

  const activeLinks = allLinks.filter(
    (l) => getLinkStatus(l, now) === "ACTIVE",
  ).length;

  const links =
    filter === "all"
      ? allLinks
      : allLinks.filter(
          (l) =>
            getLinkStatus(l, now) === (filter.toUpperCase() as ComputedStatus),
        );

  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-full bg-[#7dd3fc] p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <StatsCards
          totalLinks={stats.totalLinks}
          totalClicks={stats.totalClicks}
          uniqueVisitors={stats.uniqueVisitors}
          activeLinks={activeLinks}
        />

        <header className="neo-card p-8 sm:p-10">
          <div className="flex flex-col gap-4 border-b-4 border-black pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
                Finite Loop Club
              </p>
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
                Dashboard
              </h1>
              <p className="text-base font-semibold text-black/70">
                {allLinks.length === 1 ? "1 link" : `${allLinks.length} links`}{" "}
                · {stats.totalClicks.toLocaleString()} total clicks
              </p>
            </div>

            <Link
              href="/"
              className="neo-button self-start px-5 py-2.5 text-sm sm:self-auto"
            >
              + New Link
            </Link>
          </div>

          <nav
            aria-label="Filter links by status"
            className="mt-6 flex flex-wrap gap-2"
          >
            {FILTERS.map(({ label, value }) => {
              const active = filter === value;
              return (
                <Link
                  key={value}
                  href={
                    value === "all"
                      ? "/dashboard"
                      : `/dashboard?filter=${value}`
                  }
                  aria-current={active ? "page" : undefined}
                  className={[
                    "border-4 border-black px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wider",
                    "transition-[transform,box-shadow] duration-100",
                    active
                      ? "bg-black text-white shadow-none"
                      : "bg-white shadow-[3px_3px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000]",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <section aria-label="Links list">
          <LinksTable
            links={links}
            uniqueClicksByLinkId={uniqueClicksByLinkId}
            baseUrl={baseUrl}
            emptyMessage={EMPTY_MESSAGES[filter]}
          />
        </section>

        <AnalyticsSection
          topReferrers={topReferrers}
          deviceBreakdown={deviceBreakdown}
          timeSeries={timeSeries}
        />
      </div>
    </div>
  );
}
