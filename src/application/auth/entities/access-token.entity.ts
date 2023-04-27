import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccessTokenEntity {
  @Field()
  readonly accessToken: string;
}

export const accessTokenReturnType = () => AccessTokenEntity;
