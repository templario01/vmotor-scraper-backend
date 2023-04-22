import { PriceCurrency } from '../../vehicles/dtos/vehicle.enums';

export interface AddFavoriteVehicleBody {
  readonly externalId: string;
  readonly year: number;
  readonly url: string;
  readonly description?: string;
  readonly transmission?: string;
  readonly mileage?: number;
  readonly engineType?: string;
  readonly enginePowerRpm?: string;
  readonly enginePowerHp?: string;
  readonly engineFuelType?: string;
  readonly speeds?: number;
  readonly frontImage?: string;
  readonly images?: string;
  readonly doors?: number;
  readonly price?: number;
  readonly currency?: PriceCurrency;
}

export interface AddFavoriteVehicleDto {
  readonly vehicleInfo: AddFavoriteVehicleBody;
  readonly userId: number;
  readonly websiteUUID: string;
}
