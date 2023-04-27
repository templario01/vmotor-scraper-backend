import { Field, InputType } from '@nestjs/graphql';
import { GetVehicleCondition } from '../dtos/vehicle.enums';

export const SyncInventoryTypeFunc = () => GetVehicleCondition;

@InputType()
export class SyncInventoryInput {
  @Field(SyncInventoryTypeFunc, { description: 'Vehicle condition for sync' })
  readonly condition: GetVehicleCondition;
}
