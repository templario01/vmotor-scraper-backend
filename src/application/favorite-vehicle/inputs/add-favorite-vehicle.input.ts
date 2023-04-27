import { Field, InputType } from '@nestjs/graphql';
import { UuidInput, uuidInputResultType } from '../../../shared/dtos/nested-props';

@InputType()
export class AddFavoriteVehicleInput {
  @Field(uuidInputResultType)
  readonly vehicle: UuidInput;
}
