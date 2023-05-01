/*
  Warnings:

  - You are about to drop the `website_sync_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "website_sync_log";

-- CreateTable
CREATE TABLE "OrganizationConfiguration" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "OrganizationConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationConfiguration_name_key" ON "OrganizationConfiguration"("name");
