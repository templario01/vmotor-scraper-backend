import { Module } from '@nestjs/common';
import { RedisClient } from './redis.client';
import { EnvConfigModule } from '../../config/env-config.module';

@Module({
  imports: [EnvConfigModule],
  exports: [RedisClient],
  providers: [RedisClient],
})
export class RedisModule {}
