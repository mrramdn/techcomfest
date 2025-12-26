-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('FEEDING', 'NUTRITION', 'HEALTH', 'DEVELOPMENT', 'TIPS');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ArticleCategory" NOT NULL,
    "thumbnailImage" VARCHAR(512),
    "heroImage" VARCHAR(512),
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteArticle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "FavoriteArticle_userId_idx" ON "FavoriteArticle"("userId");

-- CreateIndex
CREATE INDEX "FavoriteArticle_articleId_idx" ON "FavoriteArticle"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteArticle_userId_articleId_key" ON "FavoriteArticle"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteArticle" ADD CONSTRAINT "FavoriteArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteArticle" ADD CONSTRAINT "FavoriteArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
