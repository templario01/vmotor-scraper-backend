import { Field, GraphQLISODateTime, HideField, ObjectType } from '@nestjs/graphql';
import { Website as PrismaWebsite } from '@prisma/client';
import { Status } from '../../../shared/dtos/status.enum';

@ObjectType()
export class WebsiteEntity implements Partial<PrismaWebsite> {
  @HideField()
  readonly id?: number;

  @HideField()
  readonly status?: Status;

  @Field()
  readonly uuid: string;

  @Field()
  readonly name: string;

  @Field()
  readonly url: string;

  @Field(() => GraphQLISODateTime)
  readonly createdAt: Date;

  @Field(() => GraphQLISODateTime)
  readonly updatedAt: Date;
}

export const websiteEntityReturnType = () => WebsiteEntity;
