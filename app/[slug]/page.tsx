import { notFound, redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
    select: { targetUrl: true },
  });

  if (!link) {
    notFound();
  }

  redirect(link.targetUrl);
}
