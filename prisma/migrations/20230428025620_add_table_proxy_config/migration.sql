/*
  Warnings:

  - You are about to drop the `OrganizationConfiguration` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ServerName" AS ENUM ('VMOTOR');

-- DropTable
DROP TABLE "OrganizationConfiguration";

-- CreateTable
CREATE TABLE "proxy_config" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,

    CONSTRAINT "proxy_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proxy_config_uuid_key" ON "proxy_config"("uuid");
