import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles/vehicle.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { JobsModule } from '../jobs/jobs.module';
import { EnvConfigModule } from '../config/env-config.module';
import { MercadolibreService } from './mercadolibre/mercadolibre.service';
import { NeoautoService } from './neoauto/neoauto.service';
import { AutocosmosService } from './autocosmos/autocosmos.service';
import { CurrencyConverterApiService } from './currency-converter-api-v1/currency-converter.service';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth/auth.service';
import { MailerModule } from './mailer/mailer.module';

const providers = [
  VehicleService,
  MercadolibreService,
  NeoautoService,
  AutocosmosService,
  CurrencyConverterApiService,
  AuthService,
];

@Module({
  imports: [PersistenceModule, JobsModule, EnvConfigModule, HttpModule, MailerModule],
  providers: [...providers],
  exports: [...providers],
})
export class ApplicationModule {}
