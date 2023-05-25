import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { UuidInput, uuidInputResultType } from '../../../shared/dtos/nested-props';

@InputType()
export class DeleteFavoriteVehicleInput {
  @Field(uuidInputResultType)
  @ValidateNested()
  readonly vehicle: UuidInput;
}
