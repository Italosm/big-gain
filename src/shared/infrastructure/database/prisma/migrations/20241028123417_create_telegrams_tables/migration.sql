-- CreateTable
CREATE TABLE "telegram_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_in" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_telegrams" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chat_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_telegrams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_tokens_user_id_key" ON "telegram_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_telegrams_user_id_key" ON "user_telegrams"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_telegrams_chat_id_key" ON "user_telegrams"("chat_id");

-- CreateIndex
CREATE INDEX "user_telegrams_status_idx" ON "user_telegrams"("status");

-- AddForeignKey
ALTER TABLE "telegram_tokens" ADD CONSTRAINT "telegram_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_telegrams" ADD CONSTRAINT "user_telegrams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
