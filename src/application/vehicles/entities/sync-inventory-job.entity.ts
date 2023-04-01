import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SyncInventoryJobEntity {
  @Field(() => GraphQLISODateTime)
  readonly startTime: Date;

  @Field(() => GraphQLISODateTime)
  readonly endTime: Date;

  @Field()
  readonly duration: string;
}

export const syncInventoryJobEntityReturnType = () => SyncInventoryJobEntity;
