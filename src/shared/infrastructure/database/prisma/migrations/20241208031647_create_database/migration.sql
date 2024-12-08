-- AlterTable
ALTER TABLE "users" ALTER COLUMN "document" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users_address" ALTER COLUMN "cep" DROP NOT NULL,
ALTER COLUMN "neighborhood" DROP NOT NULL,
ALTER COLUMN "number" DROP NOT NULL;
