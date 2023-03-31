import { Field, InputType } from '@nestjs/graphql';
import { VehicleCondition } from '../dtos/enums/vehicle.enums';

export const SyncNeoautoInventoryTypeFunc = () => VehicleCondition;

@InputType()
export class SyncNeoautoInventoryInput {
  @Field(SyncNeoautoInventoryTypeFunc, { description: 'Vehicle condition for sync' })
  readonly condition: VehicleCondition;
}
