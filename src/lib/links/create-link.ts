import { nanoid } from "nanoid";

import { getBaseUrl } from "@/src/lib/env";
import { prisma } from "@/src/lib/prisma";

const SLUG_LENGTH = 6;
const MAX_SLUG_ATTEMPTS = 5;

export class SlugCollisionError extends Error {
  constructor() {
    super("Unable to generate a unique slug after multiple attempts.");
    this.name = "SlugCollisionError";
  }
}

async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await prisma.link.findUnique({
    where: { slug },
    select: { id: true },
  });

  return existing === null;
}

async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = nanoid(SLUG_LENGTH);

    if (await isSlugAvailable(slug)) {
      return slug;
    }
  }

  throw new SlugCollisionError();
}

export async function createShortLink(targetUrl: string): Promise<string> {
  const slug = await generateUniqueSlug();

  await prisma.link.create({
    data: {
      slug,
      targetUrl,
    },
  });

  return `${getBaseUrl()}/${slug}`;
}
