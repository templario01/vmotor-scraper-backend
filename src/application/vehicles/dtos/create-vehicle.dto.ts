import { Exclude, Expose } from 'class-transformer';
import { PriceCurrency, VehicleCondition } from './vehicle.enums';

@Exclude()
class VehicleSyncDto {
  @Expose()
  readonly externalId: string;

  @Expose()
  readonly url: string;

  @Expose()
  readonly description?: string;

  @Expose()
  readonly year?: number;

  @Expose()
  readonly transmission?: string;

  @Expose()
  readonly mileage?: number;

  @Expose()
  readonly engineType?: string;

  @Expose()
  readonly enginePowerRpm?: string;

  @Expose()
  readonly enginePowerHp?: string;

  @Expose()
  readonly engineFuelType?: string;

  @Expose()
  readonly speeds?: number;

  @Expose()
  readonly frontImage?: string;

  @Expose()
  readonly images?: string;

  @Expose()
  readonly price?: number;

  @Expose()
  readonly currency?: PriceCurrency;

  @Expose()
  readonly doors?: number;

  @Expose()
  readonly condition?: VehicleCondition;
}

@Exclude()
export class CreateVehicleDto {
  @Expose()
  readonly vehicle: VehicleSyncDto;

  @Expose()
  readonly websiteId: number;
}
