import { VehicleCondition } from './vehicle.enums';

export interface UpdateInventoryStatus {
  readonly syncedVehiclesIds: string[];
  readonly websiteId: number;
  readonly vehicleCondition?: VehicleCondition;
}
