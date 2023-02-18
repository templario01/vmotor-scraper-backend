import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { PersistenceModule } from './persistence/persistence.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NEOAUTO_URL: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: '.env',
    }),
    JobsModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
