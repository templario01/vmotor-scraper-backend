import { Module } from '@nestjs/common';
import { VehicleResolver } from './resolvers/vehicle.resolver';
import { ApplicationModule } from '../application/application.module';
import { UserResolver } from './resolvers/user.resolver';

const resolvers = [VehicleResolver, UserResolver];
const controllers = [];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
  providers: [...resolvers],
})
export class ApiModule {}
