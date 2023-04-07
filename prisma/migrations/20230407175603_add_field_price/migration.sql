/*
  Warnings:

  - You are about to drop the column `penPrice` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `usdPrice` on the `vehicle` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('PEN', 'USD');

-- AlterTable
ALTER TABLE "vehicle" DROP COLUMN "penPrice",
DROP COLUMN "usdPrice",
ADD COLUMN     "currency" "Currency",
ADD COLUMN     "price" DECIMAL(12,2) DEFAULT 0;
