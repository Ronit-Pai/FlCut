import { notFound, redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import { getLinkStatus } from "@/src/lib/links/status";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: {
      targetUrl: true,
      status: true,
      goLiveAt: true,
      expiresAt: true,
    },
  });

  if (!link) notFound();

  const computedStatus = getLinkStatus(link);

  if (computedStatus === "SCHEDULED") {
    redirect(`/scheduled/${slug}`);
  }

  if (computedStatus === "EXPIRED" || computedStatus === "DISABLED") {
    redirect(`/expired/${slug}`);
  }

  redirect(link.targetUrl);
}
