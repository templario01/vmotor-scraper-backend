import { Field, InputType } from '@nestjs/graphql';
import { GetVehicleCondition } from '../dtos/vehicle.enums';

export const SyncNeoautoInventoryTypeFunc = () => GetVehicleCondition;

@InputType()
export class SyncInventoryInput {
  @Field(SyncNeoautoInventoryTypeFunc, { description: 'Vehicle condition for sync' })
  readonly condition: GetVehicleCondition;
}
