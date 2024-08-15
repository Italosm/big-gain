/*
  Warnings:

  - A unique constraint covering the columns `[pinacle_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pinacle_id" TEXT,
ADD COLUMN     "pinacle_status" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_pinacle_id_key" ON "users"("pinacle_id");
