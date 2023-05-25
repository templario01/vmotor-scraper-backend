import { Field, InputType } from '@nestjs/graphql';
import { UuidInput, uuidInputResultType } from '../../../shared/dtos/nested-props';
import { ValidateNested } from 'class-validator';

@InputType()
export class DeleteSearchInput {
  @ValidateNested({ each: true })
  @Field(uuidInputResultType)
  readonly search: UuidInput;
}
