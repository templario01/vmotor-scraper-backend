import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles/services/vehicle.service';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class ApplicationModule {}
