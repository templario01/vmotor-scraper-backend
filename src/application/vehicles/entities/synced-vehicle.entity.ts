import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { Vehicle as PrismaVehicle } from '@prisma/client';
import { Status, statusReturnType } from '../../../shared/dtos/status.enum';
import {
  PriceCurrency,
  VehicleCondition,
  priceCurrencyResultType,
} from '../dtos/vehicle.enums';
import { graphqlDateReturnType } from '../../../shared/dtos/decimal-scalar';
import {
  WebsiteEntity,
  websiteEntityReturnType,
} from '../../websites/entities/website.entity';

type Vehicle = Partial<Omit<PrismaVehicle, 'mileage' | 'price'>>;

@ObjectType()
export class SyncedVehicleEntity implements Vehicle {
  @HideField()
  readonly id: number;

  @HideField()
  readonly websiteId: number;

  @Field(websiteEntityReturnType, { nullable: true })
  readonly website?: WebsiteEntity;

  @Field(statusReturnType)
  readonly status?: Status;

  @Field()
  readonly condition: VehicleCondition;

  @Field(() => ID)
  readonly uuid: string;

  @Field()
  readonly url: string;

  @Field(graphqlDateReturnType)
  readonly createdAt: Date;

  @Field(graphqlDateReturnType)
  readonly updatedAt: Date;

  @Field()
  readonly description: string;

  @Field()
  readonly externalId: string;

  @Field()
  readonly year: number;

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

  @Field({ nullable: true })
  readonly price?: number;

  @Field(priceCurrencyResultType)
  readonly currency?: PriceCurrency;
}

export const syncedVehicleEntityReturnType = () => SyncedVehicleEntity;
export const arraySyncedVehicleEntityReturnType = () => [SyncedVehicleEntity];
