import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BrandsSyncService } from './services/brands-sync.service';
import { HttpModule } from '@nestjs/axios';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule, HttpModule, ScheduleModule.forRoot()],
  providers: [BrandsSyncService],
})
export class JobsModule {}
