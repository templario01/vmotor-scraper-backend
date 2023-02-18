import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  neoauto() {
    return {
      url: this.configService.get<string>('NEOAUTO_URL'),
    };
  }
}
