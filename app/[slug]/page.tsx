import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import { getLinkStatus } from "@/src/lib/links/status";
import { trackClick } from "@/src/lib/analytics/tracking";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: {
      id: true,
      targetUrl: true,
      isDisabled: true,
      goLiveAt: true,
      expiresAt: true,
    },
  });

  if (!link) notFound();

  const status = getLinkStatus(link);

  if (status === "DISABLED") redirect(`/disabled/${slug}`);
  if (status === "SCHEDULED") redirect(`/scheduled/${slug}`);
  if (status === "EXPIRED") redirect(`/expired/${slug}`);

  try {
    const headersList = await headers();
    await trackClick(link.id, headersList);
  } catch (err) {
    console.error("[slug] trackClick failed:", err);
  }

  redirect(link.targetUrl);
}
