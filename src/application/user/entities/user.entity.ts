import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { PaginatedUserSearchEntity } from './user-search.entity';
import { PaginatedVehicleEntity } from '../../vehicles/entities/synced-vehicle.entity';

@ObjectType()
export class UserEntity implements User {
  @Field(() => ID)
  readonly uuid: string;

  @Field()
  readonly hasActiveNotifications: boolean;

  @Field()
  readonly lastSession: Date;

  @Field()
  readonly email: string;

  @Field(() => PaginatedUserSearchEntity, { nullable: true })
  readonly searches?: PaginatedUserSearchEntity;

  @Field(() => PaginatedVehicleEntity, { nullable: true })
  readonly favoriteVehicles?: PaginatedVehicleEntity;

  @HideField()
  readonly id: number;

  @HideField()
  readonly hasConfirmedEmail: boolean;

  @HideField()
  readonly refreshToken: string;

  @HideField()
  readonly createdAt: Date;

  @HideField()
  readonly password: string;
}

export const typeofUserEntity = () => UserEntity;
