import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const RESERVED_SLUGS: Array<{ slug: string; reason: string }> = [
  { slug: "admin",     reason: "Application route" },
  { slug: "api",       reason: "Application route" },
  { slug: "dashboard", reason: "Application route" },
  { slug: "login",     reason: "Application route" },
  { slug: "signup",    reason: "Application route" },
  { slug: "settings",  reason: "Application route" },
  { slug: "analytics", reason: "Application route" },
  { slug: "links",     reason: "Application route" },
  { slug: "create",    reason: "Application route" },
  { slug: "edit",      reason: "Application route" },
  { slug: "delete",    reason: "Application route" },
  { slug: "help",      reason: "Application route" },
  { slug: "docs",      reason: "Application route" },
  { slug: "about",     reason: "Application route" },
];



async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log(`\nSeeding ${RESERVED_SLUGS.length} reserved slugs...\n`);

  for (const { slug, reason } of RESERVED_SLUGS) {
    await prisma.reservedSlug.upsert({
      where:  { slug },
      update: { reason },
      create: { slug, reason },
    });
    console.log(`  ✓  ${slug}`);
  }

  await prisma.$disconnect();

  console.log("\nSeed complete.\n");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
