/*
  Warnings:

  - You are about to drop the `PinnacleSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PinnacleSubscription" DROP CONSTRAINT "PinnacleSubscription_user_id_fkey";

-- DropTable
DROP TABLE "PinnacleSubscription";

-- CreateTable
CREATE TABLE "pinnacle_subscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pinnacle_id" TEXT NOT NULL,
    "pinnacle_status" BOOLEAN NOT NULL DEFAULT false,
    "pinnacle_date" TIMESTAMP(3) NOT NULL,
    "pinnacle_exp" TIMESTAMP(3),
    "comments" TEXT,

    CONSTRAINT "pinnacle_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pinnacle_subscription_user_id_key" ON "pinnacle_subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pinnacle_subscription_pinnacle_id_key" ON "pinnacle_subscription"("pinnacle_id");

-- AddForeignKey
ALTER TABLE "pinnacle_subscription" ADD CONSTRAINT "pinnacle_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
