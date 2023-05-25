import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UuidInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;
}

export interface UUID {
  readonly uuid: string;
}

export const uuidInputResultType = () => UuidInput;
