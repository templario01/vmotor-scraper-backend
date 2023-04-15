/*
  Warnings:

  - You are about to drop the column `brandId` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `vehicle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_brandId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_modelId_fkey";

-- AlterTable
ALTER TABLE "vehicle" DROP COLUMN "brandId",
DROP COLUMN "modelId";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_sync_log" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" TEXT NOT NULL,
    "errorMessage" TEXT,
    "vehiclesCondition" "Condition"[],

    CONSTRAINT "website_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToVehicle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserToVehicle_AB_unique" ON "_UserToVehicle"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToVehicle_B_index" ON "_UserToVehicle"("B");

-- AddForeignKey
ALTER TABLE "_UserToVehicle" ADD CONSTRAINT "_UserToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToVehicle" ADD CONSTRAINT "_UserToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
