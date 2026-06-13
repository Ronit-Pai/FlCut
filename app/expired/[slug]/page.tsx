import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";
import { getLinkStatus } from "@/src/lib/links/status";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatIstDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatIstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  }).format(date);
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `/${slug} — Expired · FLCut`,
    description: "This link has expired and is no longer active.",
    robots: { index: false },
  };
}

export default async function ExpiredPage({ params }: Props) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: { expiresAt: true, goLiveAt: true, isDisabled: true },
  });

  if (!link) notFound();

  const status = getLinkStatus(link);
  if (status !== "EXPIRED") redirect(`/${slug}`);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#fff7a8] p-6">
      <article className="neo-card w-full max-w-md space-y-6 p-8 text-center sm:p-10">
        <header className="space-y-3 border-b-4 border-black pb-6">
          <span role="img" aria-label="clock" className="block text-5xl">
            ⏰
          </span>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/50">
            /{slug}
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            Link Expired
          </h1>
          <p className="text-sm font-semibold text-black/70">
            This link has expired and is no longer accepting visitors.
          </p>
        </header>

        {link.expiresAt ? (
          <div
            className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]"
            aria-label="Link expiry time"
          >
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/50">
              Expired on
            </p>
            <p className="mt-1 font-mono text-2xl font-black">
              {formatIstDate(link.expiresAt)}
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-black/70">
              {formatIstTime(link.expiresAt)}{" "}
              <span className="text-sm font-semibold">IST</span>
            </p>
          </div>
        ) : null}

        <footer className="border-t-4 border-black pt-4">
          <p className="font-mono text-xs text-black/50">
            Contact the link creator for assistance.
          </p>
        </footer>
      </article>
    </div>
  );
}
