/*
  Warnings:

  - You are about to drop the `UserFavoriteVehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserFavoriteVehicle" DROP CONSTRAINT "UserFavoriteVehicle_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavoriteVehicle" DROP CONSTRAINT "UserFavoriteVehicle_vehicleId_fkey";

-- DropTable
DROP TABLE "UserFavoriteVehicle";

-- CreateTable
CREATE TABLE "user_favorite_vehicle" (
    "userId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_vehicle_pkey" PRIMARY KEY ("userId","vehicleId")
);

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
