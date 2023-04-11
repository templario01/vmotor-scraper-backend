import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from './dtos/config.dto';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  public neoauto() {
    return {
      url: this.configService.get<string>('NEOAUTO_URL'),
    };
  }

  public autocosmos() {
    return {
      url: this.configService.get<string>('AUTOCOSMOS_URL'),
    };
  }

  public mercadolibre() {
    return {
      url: this.configService.get<string>('MERCADOLIBRE_URL'),
    };
  }

  public app() {
    return {
      environment: this.configService.get<Environment>('NODE_ENV'),
    };
  }

  public ephemeralProxiesApiUrl() {
    return {
      url: this.configService.get<string>('EPHEMERAL_PROXIES_API_URL'),
      host: this.configService.get<string>('EPHEMERAL_PROXIES_HOST'),
      apiKey: this.configService.get<string>('EPHEMERAL_PROXIES_API_KEY'),
    };
  }
}
