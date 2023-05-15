import { Args, Query, Resolver } from '@nestjs/graphql';
import { VehicleSyncService } from '../../application/vehicles/vehicle-sync.service';
import {
  VehicleSearchEntity,
  vehicleSearchEntityReturnType,
} from '../../application/vehicles/entities/vehicle-search.entity';

@Resolver()
export class VehicleSyncResolver {
  constructor(private readonly vehicleSyncService: VehicleSyncService) {}

  @Query(vehicleSearchEntityReturnType)
  getVehiclesByWebsites(
    @Args('searchName') searchName?: string,
  ): Promise<VehicleSearchEntity> {
    return this.vehicleSyncService.getVehiclesFromWebsites(searchName);
  }
}
