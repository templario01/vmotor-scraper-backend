import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleEntity {
  @Field(() => ID)
  readonly uuid: string;

  @Field()
  readonly url: string;

  @Field(() => GraphQLISODateTime)
  readonly createdAt: Date;

  @Field(() => GraphQLISODateTime)
  readonly updatedAt: Date;

  @Field()
  readonly description: string;

  @Field({ nullable: true })
  readonly externalId?: string;

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

  @Field({ nullable: true })
  readonly price?: number;

  @Field({ nullable: true })
  readonly status?: string;

  @Field({ nullable: true })
  readonly currency?: string;
}

export const vehicleEntityReturnType = () => VehicleEntity;
