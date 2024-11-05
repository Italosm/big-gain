/*
  Warnings:

  - Changed the type of `chat_id` on the `user_telegrams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_telegrams" DROP COLUMN "chat_id",
ADD COLUMN     "chat_id" INTEGER NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_telegrams_chat_id_key" ON "user_telegrams"("chat_id");
