-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brandId" INTEGER,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "transmission" TEXT,
    "mileage" DECIMAL(12,2) DEFAULT 0,
    "engineType" TEXT,
    "enginePowerRpm" INTEGER,
    "enginePowerHp" INTEGER,
    "engineFuelType" TEXT,
    "speeds" INTEGER,
    "frontImage" TEXT,
    "images" TEXT,
    "usdPrice" DECIMAL(12,2) DEFAULT 0,
    "penPrice" DECIMAL(12,2) DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelId" INTEGER,
    "websiteId" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "brandId" INTEGER,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_uuid_key" ON "brand"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "model_brandId_name_key" ON "model"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "website_uuid_key" ON "website"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "website_name_key" ON "website"("name");

-- CreateIndex
CREATE UNIQUE INDEX "website_url_key" ON "website"("url");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_uuid_key" ON "vehicle"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_externalId_key" ON "vehicle"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_url_key" ON "vehicle"("url");

-- AddForeignKey
ALTER TABLE "model" ADD CONSTRAINT "model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
