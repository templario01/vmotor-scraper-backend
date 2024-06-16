import { Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import KeyvGzip from '@keyv/compress-gzip';
import { EnvConfigService } from '../../config/env-config.service';

@Injectable()
export class RedisClient {
  private redis: Keyv;
  private keyvAdapter: KeyvAdapter;
  private readonly logger = new Logger(RedisClient.name);
  constructor(private readonly envConfig: EnvConfigService) {
    const { url } = this.envConfig.redis;
    this.redis = new Keyv(url, {
      compresion: KeyvGzip,
    });
    this.redis.on('error', () => {
      this.logger.error('Fail to connect with Redis');
    });

    this.keyvAdapter = new KeyvAdapter(this.redis);
  }

  get adapter(): KeyvAdapter {
    return this.keyvAdapter;
  }
}
