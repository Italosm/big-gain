-- DropForeignKey
ALTER TABLE "pinnacle_subscription" DROP CONSTRAINT "pinnacle_subscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "record_sessions" DROP CONSTRAINT "record_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "stripe_subscription" DROP CONSTRAINT "stripe_subscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "telegram_tokens" DROP CONSTRAINT "telegram_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_telegrams" DROP CONSTRAINT "user_telegrams_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_nacionalidade_id_fkey";

-- DropForeignKey
ALTER TABLE "users_tokens" DROP CONSTRAINT "users_tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "users_address" ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users_tokens" ADD CONSTRAINT "users_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_sessions" ADD CONSTRAINT "record_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_tokens" ADD CONSTRAINT "telegram_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_telegrams" ADD CONSTRAINT "user_telegrams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinnacle_subscription" ADD CONSTRAINT "pinnacle_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_subscription" ADD CONSTRAINT "stripe_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
