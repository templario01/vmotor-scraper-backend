import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleEntity {
  @Field({ nullable: true })
  readonly url?: string;

  @Field({ nullable: true })
  readonly externalId?: string;

  @Field({ nullable: true })
  readonly description?: string;

  @Field({ nullable: true })
  readonly year?: number;

  @Field({ nullable: true })
  readonly transmission?: string;

  @Field({ nullable: true })
  readonly mileage?: number;

  @Field({ nullable: true })
  readonly engineType?: string;

  @Field({ nullable: true })
  readonly enginePowerRpm?: string;

  @Field({ nullable: true })
  readonly enginePowerHp?: string;

  @Field({ nullable: true })
  readonly engineFuelType?: string;

  @Field({ nullable: true })
  readonly speeds?: number;

  @Field({ nullable: true })
  readonly frontImage?: string;

  @Field({ nullable: true })
  readonly images?: string;

  @Field({ nullable: true })
  readonly doors?: number;

  @Field(() => Float, { nullable: true })
  readonly price?: number;

  @Field(() => Float, { nullable: true })
  readonly originalPrice?: number;

  @Field(() => Boolean)
  readonly isEstimatedPrice?: boolean;

  @Field({ nullable: true })
  readonly currency?: string;
}

export const vehicleEntityReturnType = () => VehicleEntity;
export const vehiclesEntityReturnType = () => [VehicleEntity];
