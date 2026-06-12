import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";
import { getBaseUrl } from "@/src/lib/env";
import { getLinkStatus } from "@/src/lib/links/status";
import { LinksTable } from "@/components/dashboard/links-table";
import type { ComputedStatus } from "@/src/lib/links/status";

export const metadata: Metadata = {
  title: "Dashboard — FLCut",
  description: "All shortened links created with FLCut.",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Expired", value: "expired" },
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
};

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { filter: rawFilter = "all" } = await searchParams;
  const filter: FilterValue = isValidFilter(rawFilter) ? rawFilter : "all";

  const allLinks = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const links =
    filter === "all"
      ? allLinks
      : allLinks.filter(
          (link) =>
            getLinkStatus(link, now) ===
            (filter.toUpperCase() as ComputedStatus),
        );

  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-full bg-[#7dd3fc] p-6">
      <div className="mx-auto max-w-6xl space-y-8">
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
                {allLinks.length === 1
                  ? "1 link created"
                  : `${allLinks.length} links created`}
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
              const isActive = filter === value;
              return (
                <Link
                  key={value}
                  href={
                    value === "all"
                      ? "/dashboard"
                      : `/dashboard?filter=${value}`
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "border-4 border-black px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wider",
                    "transition-[transform,box-shadow] duration-100",
                    isActive
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
            baseUrl={baseUrl}
            emptyMessage={EMPTY_MESSAGES[filter]}
          />
        </section>
      </div>
    </div>
  );
}
