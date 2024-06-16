import { Condition } from '../../application/vehicles/enums/vehicle.enums';
import { PriceCurrency } from '../enums/currency.enum';

class VehicleSyncDto {
  readonly externalId: string;
  readonly url: string;
  readonly description?: string;
  readonly name?: string;
  readonly year?: number;
  readonly transmission?: string;
  readonly mileage?: number;
  readonly speeds?: number;
  readonly frontImage?: string;
  readonly images?: string;
  readonly price?: number;
  readonly originalPrice?: number;
  readonly currency?: PriceCurrency;
  readonly doors?: number;
  readonly condition?: Condition;
  readonly location?: string;
}

export class CreateVehicleDto {
  readonly vehicle: VehicleSyncDto;
  readonly websiteId: number;
}

export class UpdateInventoryStatusDto {
  readonly syncedVehiclesIds: string[];
  readonly websiteId: string;
  readonly condition?: Condition;
}
