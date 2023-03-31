-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "vehicle" ADD COLUMN     "condition" "Condition";
