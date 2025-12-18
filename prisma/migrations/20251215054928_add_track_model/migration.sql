-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MealDuration" AS ENUM ('LESS_THAN_10', 'TEN_TO_TWENTY', 'TWENTY_TO_THIRTY', 'MORE_THAN_30');

-- CreateEnum
CREATE TYPE "TexturePreference" AS ENUM ('PUREED', 'SOFT_MASHED', 'SEMI_CHUNKY', 'SOLID_FINGER_FOOD');

-- CreateEnum
CREATE TYPE "EatingPatternChange" AS ENUM ('NO', 'SLIGHTLY', 'MODERATELY', 'SIGNIFICANTLY');

-- CreateEnum
CREATE TYPE "WeightEnergyLevel" AS ENUM ('NORMAL_WEIGHT', 'WEIGHT_STAGNANT', 'WEIGHT_DECREASING');

-- CreateEnum
CREATE TYPE "MealTime" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "ChildResponse" AS ENUM ('FINISHED', 'PARTIALLY', 'REFUSED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATED', 'VIEWED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photo" TEXT,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "age" INTEGER NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "favoriteFood" TEXT,
    "hatedFood" TEXT,
    "foodAllergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "refusalBehaviors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mealDuration" "MealDuration" NOT NULL,
    "texturePreference" "TexturePreference" NOT NULL,
    "eatingPatternChange" "EatingPatternChange" NOT NULL,
    "weightEnergyLevel" "WeightEnergyLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "photo" TEXT,
    "foodName" TEXT NOT NULL,
    "mealTime" "MealTime" NOT NULL,
    "childResponse" "ChildResponse" NOT NULL,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "summary" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "mealDetails" JSONB NOT NULL,
    "totalMeals" INTEGER NOT NULL DEFAULT 0,
    "mealsFinished" INTEGER NOT NULL DEFAULT 0,
    "mealsPartial" INTEGER NOT NULL DEFAULT 0,
    "mealsRefused" INTEGER NOT NULL DEFAULT 0,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Child_userId_idx" ON "Child"("userId");

-- CreateIndex
CREATE INDEX "MealLog_childId_idx" ON "MealLog"("childId");

-- CreateIndex
CREATE INDEX "MealLog_loggedAt_idx" ON "MealLog"("loggedAt");

-- CreateIndex
CREATE INDEX "Report_childId_idx" ON "Report"("childId");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");

-- CreateIndex
CREATE INDEX "Report_generatedAt_idx" ON "Report"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_childId_reportType_period_key" ON "Report"("childId", "reportType", "period");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
