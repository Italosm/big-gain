/*
  Warnings:

  - You are about to drop the column `pinacle_date` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pinacle_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pinacle_status` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_pinacle_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "pinacle_date",
DROP COLUMN "pinacle_id",
DROP COLUMN "pinacle_status";

-- CreateTable
CREATE TABLE "PinnacleSubscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pinnacle_id" TEXT NOT NULL,
    "pinnacle_status" BOOLEAN NOT NULL DEFAULT false,
    "pinnacle_date" TIMESTAMP(3) NOT NULL,
    "pinnacle_exp" TIMESTAMP(3),
    "comments" TEXT,

    CONSTRAINT "PinnacleSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PinnacleSubscription_user_id_key" ON "PinnacleSubscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PinnacleSubscription_pinnacle_id_key" ON "PinnacleSubscription"("pinnacle_id");

-- AddForeignKey
ALTER TABLE "PinnacleSubscription" ADD CONSTRAINT "PinnacleSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
