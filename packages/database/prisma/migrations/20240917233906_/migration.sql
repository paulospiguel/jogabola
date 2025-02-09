-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('Scheduled', 'InProgress', 'Finished', 'Postponed', 'Cancelled');

-- CreateEnum
CREATE TYPE "CupStatus" AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "founded" TIMESTAMP(3),
ADD COLUMN     "homeGround" TEXT,
ADD COLUMN     "manager" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Cup" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" VARCHAR(255) NOT NULL,
    "status" "CupStatus" NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "Cup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "matchTime" TIMESTAMP(3) NOT NULL,
    "stadium" VARCHAR(255) NOT NULL,
    "homeTeamScore" INTEGER,
    "awayTeamScore" INTEGER,
    "matchStatus" "MatchStatus" NOT NULL,
    "cupId" INTEGER,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamStatistics" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "drawn" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamStatistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStatistics" ADD CONSTRAINT "TeamStatistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
