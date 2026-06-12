import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";
import { getLinkStatus } from "@/src/lib/links/status";
import { Countdown } from "@/components/countdown";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatUtcDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatUtcTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `/${slug} — Coming Soon · FLCut`,
    description: "This link is scheduled and not yet active.",
    robots: { index: false },
  };
}

export default async function ScheduledPage({ params }: Props) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: { goLiveAt: true, expiresAt: true, status: true },
  });

  if (!link) notFound();

  const computedStatus = getLinkStatus(link);
  if (computedStatus !== "SCHEDULED") redirect(`/${slug}`);

  const goLiveAt = link.goLiveAt!;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#7dd3fc] p-6">
      <article className="neo-card w-full max-w-md space-y-6 p-8 text-center sm:p-10">

        
        <header className="space-y-3 border-b-4 border-black pb-6">
          <span role="img" aria-label="rocket" className="block text-5xl">
            🚀
          </span>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/50">
            /{slug}
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            Link Not Active Yet
          </h1>
          <p className="text-sm font-semibold text-black/70">
            This link will become available on:
          </p>
        </header>
        <div
          className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]"
          aria-label="Scheduled activation time"
        >
          <p className="font-mono text-2xl font-black">
            {formatUtcDate(goLiveAt)}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-black/70">
            {formatUtcTime(goLiveAt)}{" "}
            <span className="text-sm font-semibold">UTC</span>
          </p>
        </div>
        <Countdown targetDate={goLiveAt.toISOString()} mode="starts" />

        <footer className="border-t-4 border-black pt-4">
          <p className="font-mono text-xs text-black/50">
            Come back after the scheduled time to access this link.
          </p>
        </footer>

      </article>
    </div>
  );
}
