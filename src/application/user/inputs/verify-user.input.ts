import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class VerifyUserInput {
  @Field()
  @IsEmail()
  readonly email: string;

  @Field()
  readonly code: string;
}
