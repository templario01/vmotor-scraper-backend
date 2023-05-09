import { Field, ObjectType } from '@nestjs/graphql';
import { graphqlDateReturnType } from '../../../shared/dtos/decimal-scalar';

@ObjectType()
export class UserSearchEntity {
  @Field(graphqlDateReturnType)
  readonly createdAt: Date;

  @Field()
  readonly text: string;
}

export const userSearchEntityReturnType = () => UserSearchEntity;
