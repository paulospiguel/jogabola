/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_email_key" ON "Team"("email");
