/*
  Warnings:

  - You are about to drop the column `lastEmailSent` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastEmailSent";

-- CreateTable
CREATE TABLE "email_validation_code" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expirationTime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "email_validation_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_validation_code_uuid_key" ON "email_validation_code"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "email_validation_code_userId_key" ON "email_validation_code"("userId");

-- AddForeignKey
ALTER TABLE "email_validation_code" ADD CONSTRAINT "email_validation_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
