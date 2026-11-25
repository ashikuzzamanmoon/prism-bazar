-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "isPublish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "isPublish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "isSide" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "type" "BannerType" DEFAULT 'IMAGE',
    "video" TEXT,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "banners_slug_key" ON "banners"("slug");
