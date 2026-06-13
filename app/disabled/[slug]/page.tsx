import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `/${slug} — Disabled · FLCut`,
    description: "This link has been disabled.",
    robots: { index: false },
  };
}

export default async function DisabledPage({ params }: Props) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: { isDisabled: true },
  });

  if (!link) notFound();

  if (!link.isDisabled) redirect(`/${slug}`);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#fff7a8] p-6">
      <article className="neo-card w-full max-w-md space-y-6 p-8 text-center sm:p-10">
        <header className="space-y-3 border-b-4 border-black pb-6">
          <span role="img" aria-label="lock" className="block text-5xl">
            🔒
          </span>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/50">
            /{slug}
          </p>
          <h1 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            Link Disabled
          </h1>
          <p className="text-sm font-semibold text-black/70">
            This link has been disabled by the administrator.
          </p>
        </header>

        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
          <p className="font-mono text-sm text-black/60">
            If you believe this is a mistake, please contact the link creator.
          </p>
        </div>

        <footer className="border-t-4 border-black pt-4">
          <p className="font-mono text-xs text-black/50">
            Contact the link creator for assistance.
          </p>
        </footer>
      </article>
    </div>
  );
}
