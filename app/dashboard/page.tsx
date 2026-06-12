import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";
import { getBaseUrl } from "@/src/lib/env";
import { LinksTable } from "@/components/dashboard/links-table";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage Links.",
};

export default async function DashboardPage() {
  const links = await prisma.link.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
                {links.length === 1
                  ? "1 link created"
                  : `${links.length} links created`}
              </p>
            </div>

            <Link
              href="/"
              className="neo-button self-start px-5 py-2.5 text-sm sm:self-auto"
            >
              + New Link
            </Link>
          </div>
        </header>

        {/* Table */}
        <section aria-label="Links list">
          <LinksTable links={links} baseUrl={baseUrl} />
        </section>
      </div>
    </div>
  );
}
