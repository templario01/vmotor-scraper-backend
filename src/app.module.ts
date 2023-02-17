import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [JobsModule, PersistenceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
