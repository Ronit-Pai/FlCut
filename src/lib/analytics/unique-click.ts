import { prisma } from "@/src/lib/prisma";

const UNIQUE_WINDOW_MS = 24 * 60 * 60 * 1000; 
export async function isUniqueClick(
  linkId: string,
  ipHash: string | null,
  userAgent: string | null,
): Promise<boolean> {
  if (!ipHash) return false;

  const since = new Date(Date.now() - UNIQUE_WINDOW_MS);

  const existing = await prisma.clickEvent.findFirst({
    where: {
      linkId,
      ipHash,
      userAgent: userAgent ?? undefined,
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  return existing === null;
}
