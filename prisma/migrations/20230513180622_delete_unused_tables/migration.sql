/*
  Warnings:

  - You are about to drop the column `doors` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `engineFuelType` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `enginePowerHp` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `enginePowerRpm` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `engineType` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `speeds` on the `vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vehicle" DROP COLUMN "doors",
DROP COLUMN "engineFuelType",
DROP COLUMN "enginePowerHp",
DROP COLUMN "enginePowerRpm",
DROP COLUMN "engineType",
DROP COLUMN "speeds";
