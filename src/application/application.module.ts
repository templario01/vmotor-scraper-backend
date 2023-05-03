import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles/vehicle.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { JobsModule } from '../jobs/jobs.module';
import { EnvConfigModule } from '../config/env-config.module';
import { MercadolibreService } from './mercadolibre/mercadolibre.service';
import { NeoautoService } from './neoauto/neoauto.service';
import { AutocosmosService } from './autocosmos/autocosmos.service';
import { CurrencyConverterApiService } from './currency-converter-api-v1/currency-converter.service';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth/auth.service';
import { MailerModule } from './mailer/mailer.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from '../config/env-config.service';
import { FavoriteVehicleService } from './favorite-vehicle/favorite-vehicle.service';
import { WebsiteService } from './websites/website.service';
import { VehicleSyncService } from './vehicles/vehicle-sync.service';
import { UserService } from './user/user.service';

const providers = [
  VehicleService,
  VehicleSyncService,
  MercadolibreService,
  NeoautoService,
  AutocosmosService,
  CurrencyConverterApiService,
  AuthService,
  FavoriteVehicleService,
  WebsiteService,
  UserService,
];

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: async (envConfigService: EnvConfigService) => {
        const { expirationTime, secret } = envConfigService.jwtConfig();

        return {
          global: true,
          signOptions: { expiresIn: expirationTime },
          secret,
        };
      },
    }),
    PersistenceModule,
    JobsModule,
    EnvConfigModule,
    HttpModule,
    MailerModule,
  ],
  providers: [...providers],
  exports: [...providers],
})
export class ApplicationModule {}
