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

export class AliasAlreadyTakenError extends Error {
  constructor() {
    super("Alias already taken.");
    this.name = "AliasAlreadyTakenError";
  }
}

export class AliasReservedError extends Error {
  constructor() {
    super("Reserved alias.");
    this.name = "AliasReservedError";
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


async function resolveSlug(alias?: string | null): Promise<string> {
  if (!alias) {
    return generateUniqueSlug();
  }

  
  const reserved = await prisma.reservedSlug.findUnique({
    where: { slug: alias },
    select: { id: true },
  });
  if (reserved) throw new AliasReservedError();

  
  const existing = await prisma.link.findUnique({
    where: { slug: alias },
    select: { id: true },
  });
  if (existing) throw new AliasAlreadyTakenError();

  return alias;
}


export async function createShortLink(
  targetUrl: string,
  alias?: string | null,
): Promise<string> {
  const slug = await resolveSlug(alias);

  await prisma.link.create({
    data: { slug, targetUrl },
  });

  return `${getBaseUrl()}/${slug}`;
}
