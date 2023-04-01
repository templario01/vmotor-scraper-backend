import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles/services/vehicle.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [PersistenceModule, JobsModule],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class ApplicationModule {}
