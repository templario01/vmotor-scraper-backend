/*
  Warnings:

  - You are about to drop the `vehicle_search` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "vehicle_search" DROP CONSTRAINT "vehicle_search_userId_fkey";

-- DropTable
DROP TABLE "vehicle_search";

-- CreateTable
CREATE TABLE "search" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "search" JSONB NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "search_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "search_uuid_key" ON "search"("uuid");

-- AddForeignKey
ALTER TABLE "search" ADD CONSTRAINT "search_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
