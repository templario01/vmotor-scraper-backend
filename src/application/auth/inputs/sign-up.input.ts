import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class SignUpInput {
  @Field()
  @IsEmail()
  readonly email: string;

  @Field()
  @IsNotEmpty()
  readonly password: string;
}
