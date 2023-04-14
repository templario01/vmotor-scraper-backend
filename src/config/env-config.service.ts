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
      appHost: this.configService.get<Environment>('APP_HOST'),
    };
  }

  public ephemeralProxiesApi() {
    return {
      url: this.configService.get<string>('EPHEMERAL_PROXIES_API'),
      host: this.configService.get<string>('EPHEMERAL_PROXIES_HOST'),
    };
  }

  public currencyConverterApi() {
    return {
      url: this.configService.get<string>('CURRENCY_CONVERTER_API'),
      host: this.configService.get<string>('CURRENCY_CONVERTER_HOST'),
    };
  }

  public mailerConfig() {
    return {
      mailSender: this.configService.get<string>('MAIL_SENDER'),
      mailPassword: this.configService.get<string>('MAIL_PASSWORD'),
      mailPort: this.configService.get<string>('MAIL_PORT'),
      mailHost: this.configService.get<string>('MAIL_HOST'),
    };
  }

  public jwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      expirationTime: this.configService.get<string>('JWT_EXPIRATION_TIME'),
    };
  }

  public rapidApi() {
    return {
      apiKey: this.configService.get<string>('RAPIDAPI_KEY'),
    };
  }
}
