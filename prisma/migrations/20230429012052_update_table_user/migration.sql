/*
  Warnings:

  - Made the column `userId` on table `email_validation_code` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "email_validation_code" DROP CONSTRAINT "email_validation_code_userId_fkey";

-- DropIndex
DROP INDEX "email_validation_code_userId_key";

-- AlterTable
ALTER TABLE "email_validation_code" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "email_validation_code" ADD CONSTRAINT "email_validation_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
