-- CreateTable
CREATE TABLE "vehicle_search" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "search" JSONB NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "vehicle_search_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle_search" ADD CONSTRAINT "vehicle_search_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
