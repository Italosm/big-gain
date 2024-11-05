/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `user_telegrams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `user_telegrams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_telegrams" ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nacionalidade_id" INTEGER,
ADD COLUMN     "pinnacle_refusal" BOOLEAN;

-- CreateTable
CREATE TABLE "countries" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "iso_code" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_telegrams_phone_key" ON "user_telegrams"("phone");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_nacionalidade_id_fkey" FOREIGN KEY ("nacionalidade_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
