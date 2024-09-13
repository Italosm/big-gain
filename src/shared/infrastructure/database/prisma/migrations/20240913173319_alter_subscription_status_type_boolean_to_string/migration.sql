-- AlterTable
ALTER TABLE "stripe_subscription" ALTER COLUMN "subscription_status" DROP NOT NULL,
ALTER COLUMN "subscription_status" DROP DEFAULT,
ALTER COLUMN "subscription_status" SET DATA TYPE TEXT;
