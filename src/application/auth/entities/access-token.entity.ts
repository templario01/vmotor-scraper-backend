import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccessTokenEntity {
  @Field()
  readonly accessToken: string;

  @Field()
  readonly expiresIn: string;
}

export const accessTokenReturnType = () => AccessTokenEntity;
