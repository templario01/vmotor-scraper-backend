import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class VehicleSyncDto {
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
  readonly usdPrice?: number;

  @Expose()
  readonly penPrice?: number;

  @Expose()
  readonly doors?: number;
}
