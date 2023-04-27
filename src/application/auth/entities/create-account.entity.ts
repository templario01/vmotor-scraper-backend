import { Field, ObjectType } from '@nestjs/graphql';
import { graphqlDateReturnType } from '../../../shared/dtos/decimal-scalar';

@ObjectType()
export class CreateAccountEntity {
  @Field()
  readonly message: string;

  @Field(graphqlDateReturnType)
  readonly expirationTime: Date;
}

export const createAccountReturnType = () => CreateAccountEntity;
