import { Module } from '@nestjs/common';
import { VehicleResolver } from './resolvers/vehicle.resolver';
import { ApplicationModule } from '../application/application.module';

const resolvers = [VehicleResolver];
const controllers = [];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
  providers: [...resolvers],
})
export class ApiModule {}
