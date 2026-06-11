-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "goLiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "clickLimit" INTEGER,
    "currentClicks" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ipHash" VARCHAR(255),
    "userAgent" TEXT,
    "referrer" VARCHAR(255),
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserved_slugs" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "reason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reserved_slugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_slug_key" ON "links"("slug");

-- CreateIndex
CREATE INDEX "links_slug_idx" ON "links"("slug");

-- CreateIndex
CREATE INDEX "links_createdAt_idx" ON "links"("createdAt");

-- CreateIndex
CREATE INDEX "links_goLiveAt_idx" ON "links"("goLiveAt");

-- CreateIndex
CREATE INDEX "links_expiresAt_idx" ON "links"("expiresAt");

-- CreateIndex
CREATE INDEX "click_events_linkId_idx" ON "click_events"("linkId");

-- CreateIndex
CREATE INDEX "click_events_createdAt_idx" ON "click_events"("createdAt");

-- CreateIndex
CREATE INDEX "click_events_country_idx" ON "click_events"("country");

-- CreateIndex
CREATE INDEX "click_events_deviceType_idx" ON "click_events"("deviceType");

-- CreateIndex
CREATE INDEX "click_events_isBot_idx" ON "click_events"("isBot");

-- CreateIndex
CREATE UNIQUE INDEX "reserved_slugs_slug_key" ON "reserved_slugs"("slug");

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
