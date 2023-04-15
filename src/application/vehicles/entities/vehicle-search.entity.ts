import { Field, ObjectType } from '@nestjs/graphql';
import { VehicleEntity, vehiclesEntityReturnType } from './vehicle.entity';

@ObjectType()
export class VehicleSearchEntity {
  @Field()
  duration: string;

  @Field(vehiclesEntityReturnType)
  vehicles: VehicleEntity[];
}

export const vehicleSearchEntityReturnType = () => VehicleSearchEntity;
