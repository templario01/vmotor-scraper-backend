import { Module } from '@nestjs/common';
import { VehicleResolver } from './resolvers/vehicle.resolver';
import { ApplicationModule } from '../application/application.module';
import { UserResolver } from './resolvers/user.resolver';
import { HealthController } from './controllers/health';
import { EnvConfigModule } from '../config/env-config.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './resolvers/auth.resolver';
import { UserVehicleResolver } from './resolvers/user-vehicle.resolver';

const resolvers = [VehicleResolver, UserResolver, AuthResolver, UserVehicleResolver];
const controllers = [HealthController];
const authGuardModules = [EnvConfigModule, PersistenceModule, JwtModule];

@Module({
  imports: [ApplicationModule, ...authGuardModules],
  controllers: [...controllers],
  providers: [...resolvers],
})
export class ApiModule {}
