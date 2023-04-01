import { Field, InputType } from '@nestjs/graphql';
import { GetVehicleCondition } from '../dtos/enums/vehicle.enums';

export const SyncNeoautoInventoryTypeFunc = () => GetVehicleCondition;

@InputType()
export class SyncNeoautoInventoryInput {
  @Field(SyncNeoautoInventoryTypeFunc, { description: 'Vehicle condition for sync' })
  readonly condition: GetVehicleCondition;
}
