import { Field, Float, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import {
  PriceCurrency,
  VehicleCondition,
  priceCurrencyResultType,
  vehicleConditionReturnType,
} from '../../vehicles/dtos/vehicle.enums';
import { UuidInput, uuidInputResultType } from '../../../shared/dtos/nested-props';

@InputType()
export class AddFavoriteVehicleInput {
  @Field(uuidInputResultType)
  @ValidateNested()
  readonly website: UuidInput;

  @Field()
  readonly externalId: string;

  @Field()
  readonly year: number;

  @Field()
  readonly url: string;

  @Field({ nullable: true })
  readonly description?: string;

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

  @Field(priceCurrencyResultType)
  readonly currency: PriceCurrency;

  @Field(vehicleConditionReturnType)
  readonly condition: VehicleCondition;
}
