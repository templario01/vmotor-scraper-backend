import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { PersistenceModule } from '../persistence/persistence.module';
import { EnvConfigModule } from '../config/env-config.module';
import { NeoAutoSyncService } from './services/neo-auto-sync.service';
import { MercadolibreSyncService } from './services/mercadolibre-sync.service';
import { AutocosmosSyncService } from './services/autocosmos-sync.service';
import { ProxyService } from '../application/proxy/proxy.service';
import { CurrencyConverterApiService } from '../application/currency-converter-api-v1/currency-converter.service';

const providers = [
  NeoAutoSyncService,
  MercadolibreSyncService,
  AutocosmosSyncService,
  ProxyService,
  CurrencyConverterApiService,
];

@Module({
  imports: [EnvConfigModule, PersistenceModule, HttpModule, ScheduleModule.forRoot()],
  providers: [...providers],
  exports: [...providers],
})
export class JobsModule {}
