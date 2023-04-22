import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UuidInput {
  @Field()
  readonly uuid: string;
}

export interface UUID {
  readonly uuid: string;
}

export const uuidInputResultType = () => UuidInput;
