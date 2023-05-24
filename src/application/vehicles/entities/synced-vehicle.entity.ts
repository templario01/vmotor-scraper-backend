import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { Vehicle as PrismaVehicle } from '@prisma/client';
import { Status, statusReturnType } from '../../../shared/dtos/status.enum';
import {
  PriceCurrency,
  VehicleCondition,
  typeofPriceCurrency,
} from '../enums/vehicle.enums';
import { graphqlDateReturnType } from '../../../shared/dtos/decimal-scalar';
import {
  WebsiteEntity,
  websiteEntityReturnType,
} from '../../websites/entities/website.entity';
import {
  IPaginatedResponse,
  PaginatedResponse,
} from '../../../shared/utils/pagination/cursor-pagination';

type Vehicle = Partial<Omit<PrismaVehicle, 'mileage' | 'price' | 'originalPrice'>>;

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
  readonly frontImage?: string;

  @Field({ nullable: true })
  readonly images?: string;

  @Field({ nullable: true })
  readonly price?: number;

  @Field({ nullable: true })
  readonly originalPrice?: number;

  @Field({ nullable: true })
  readonly location?: string;

  @Field(typeofPriceCurrency)
  readonly currency?: PriceCurrency;
}

export const syncedVehicleEntityReturnType = () => SyncedVehicleEntity;
export const arraySyncedVehicleEntityReturnType = () => [SyncedVehicleEntity];

@ObjectType()
export class PaginatedVehicleEntity extends PaginatedResponse(SyncedVehicleEntity) {}
export type IPaginatedVehicleEntity = IPaginatedResponse<SyncedVehicleEntity>;

export const typeofPaginatedVehicleEntity = () => PaginatedVehicleEntity;
