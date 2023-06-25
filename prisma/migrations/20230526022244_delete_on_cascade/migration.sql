-- DropForeignKey
ALTER TABLE "email_validation_code" DROP CONSTRAINT "email_validation_code_user_id_fkey";

-- DropForeignKey
ALTER TABLE "search" DROP CONSTRAINT "search_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_favorite_vehicle" DROP CONSTRAINT "user_favorite_vehicle_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_favorite_vehicle" DROP CONSTRAINT "user_favorite_vehicle_vehicle_id_fkey";

-- AddForeignKey
ALTER TABLE "search" ADD CONSTRAINT "search_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_validation_code" ADD CONSTRAINT "email_validation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_vehicle" ADD CONSTRAINT "user_favorite_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
