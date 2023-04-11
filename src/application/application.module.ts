import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles/services/vehicle.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { JobsModule } from '../jobs/jobs.module';
import { EnvConfigModule } from '../config/env-config.module';
import { MercadolibreService } from './mercadolibre/mercadolibre.service';
import { NeoautoService } from './neoauto/neoauto.service';
import { AutocosmosService } from './autocosmos/autocosmos.service';

const providers = [
  VehicleService,
  MercadolibreService,
  NeoautoService,
  AutocosmosService,
];

@Module({
  imports: [PersistenceModule, JobsModule, EnvConfigModule],
  providers: [...providers],
  exports: [...providers],
})
export class ApplicationModule {}
