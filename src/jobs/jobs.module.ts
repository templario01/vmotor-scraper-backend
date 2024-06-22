import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { PersistenceModule } from '../persistence/persistence.module';
import { EnvConfigModule } from '../config/env-config.module';
import { AutocosmosSyncService } from './autocosmos/autocosmos-sync.service';
import { ProxyService } from '../application/proxy/proxy.service';

import { MercadolibreSyncService } from './mercadolibre/mercadolibre-sync.service';
import { NeoAutoSyncService } from './neoauto/neoauto-sync.service';
import { CurrencyConverterApiService } from './services/currency-converter.service';
import { AutopiaSyncService } from './autopia/autopia-sync.service';

const providers = [
  NeoAutoSyncService,
  MercadolibreSyncService,
  AutocosmosSyncService,
  AutopiaSyncService,
  ProxyService,
];

@Module({
  imports: [EnvConfigModule, PersistenceModule, HttpModule, ScheduleModule.forRoot()],
  providers: [...providers, CurrencyConverterApiService],
  exports: [...providers],
})
export class JobsModule {}
