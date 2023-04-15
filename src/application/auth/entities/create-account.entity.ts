import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateAccountEntity {
  @Field()
  readonly message: string;
}

export const createAccountReturnType = () => CreateAccountEntity;
