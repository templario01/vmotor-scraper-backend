import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BrandsSyncService } from './services/brands-sync.service';
import { HttpModule } from '@nestjs/axios';
import { PersistenceModule } from '../persistence/persistence.module';
import { EnvConfigModule } from '../config/env-config.module';
import { NeoAutoSyncService } from './services/neo-auto-sync.service';
import { MercadolibreSyncService } from './services/mercadolibre-sync.service';

const providers = [BrandsSyncService, NeoAutoSyncService, MercadolibreSyncService];

@Module({
  imports: [EnvConfigModule, PersistenceModule, HttpModule, ScheduleModule.forRoot()],
  providers: [...providers],
  exports: [...providers],
})
export class JobsModule {}
