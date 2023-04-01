import { Exclude, Expose } from 'class-transformer';
import { VehicleSyncDto } from './neoauto.dto';

@Exclude()
export class CreateVehicleDto {
  @Expose()
  readonly vehicle: VehicleSyncDto;

  @Expose()
  readonly brandId: number;

  @Expose()
  readonly modelId?: number;

  @Expose()
  readonly websiteId?: number;
}
