/*
  Warnings:

  - You are about to drop the column `createdAt` on the `email_validation_code` table. All the data in the column will be lost.
  - You are about to drop the column `expirationTime` on the `email_validation_code` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `email_validation_code` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `email_validation_code` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `proxy_config` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `search` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `search` table. All the data in the column will be lost.
  - You are about to drop the column `hasActiveNotifications` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `hasConfirmedEmail` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastSession` on the `user` table. All the data in the column will be lost.
  - The primary key for the `user_favorite_vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedAt` on the `user_favorite_vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_favorite_vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `user_favorite_vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `frontImage` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `websiteId` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `website` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `website` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[external_id]` on the table `vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiration_time` to the `email_validation_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `email_validation_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `proxy_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_favorite_vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_id` to the `user_favorite_vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "email_validation_code" DROP CONSTRAINT "email_validation_code_userId_fkey";

-- DropForeignKey
ALTER TABLE "search" DROP CONSTRAINT "search_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_favorite_vehicle" DROP CONSTRAINT "user_favorite_vehicle_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_favorite_vehicle" DROP CONSTRAINT "user_favorite_vehicle_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_websiteId_fkey";

-- DropIndex
DROP INDEX "vehicle_externalId_key";

-- AlterTable
ALTER TABLE "email_validation_code" DROP COLUMN "createdAt",
DROP COLUMN "expirationTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiration_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "proxy_config" DROP COLUMN "expiresAt",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "search" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "hasActiveNotifications",
DROP COLUMN "hasConfirmedEmail",
DROP COLUMN "lastSession",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "has_active_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_confirmed_email" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lat_session" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_favorite_vehicle" DROP CONSTRAINT "user_favorite_vehicle_pkey",
DROP COLUMN "assignedAt",
DROP COLUMN "userId",
DROP COLUMN "vehicleId",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "vehicle_id" INTEGER NOT NULL,
ADD CONSTRAINT "user_favorite_vehicle_pkey" PRIMARY KEY ("user_id", "vehicle_id");

-- AlterTable
ALTER TABLE "vehicle" DROP COLUMN "createdAt",
DROP COLUMN "externalId",
DROP COLUMN "frontImage",
DROP COLUMN "originalPrice",
DROP COLUMN "updatedAt",
DROP COLUMN "websiteId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "front_image" TEXT,
ADD COLUMN     "original_price" DECIMAL(12,2) DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website_id" INTEGER;

-- AlterTable
ALTER TABLE "website" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_external_id_key" ON "vehicle"("external_id");

-- AddForeignKey
ALTER TABLE "search" ADD CONSTRAINT "search_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_validation_code" ADD CONSTRAINT "email_validation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("id") ON DELETE SET NULL ON UPDATE CASCADE;
