/*
  Warnings:

  - You are about to drop the `_UserToVehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserToVehicle" DROP CONSTRAINT "_UserToVehicle_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToVehicle" DROP CONSTRAINT "_UserToVehicle_B_fkey";

-- DropTable
DROP TABLE "_UserToVehicle";

-- CreateTable
CREATE TABLE "UserFavoriteVehicle" (
    "userId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteVehicle_pkey" PRIMARY KEY ("userId","vehicleId")
);

-- AddForeignKey
ALTER TABLE "UserFavoriteVehicle" ADD CONSTRAINT "UserFavoriteVehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteVehicle" ADD CONSTRAINT "UserFavoriteVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
