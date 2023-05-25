/*
  Warnings:

  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "model" DROP CONSTRAINT "model_brandId_fkey";

-- DropTable
DROP TABLE "brand";

-- DropTable
DROP TABLE "model";
