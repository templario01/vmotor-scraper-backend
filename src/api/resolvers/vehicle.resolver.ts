import { Args, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/vehicle.service';
import { PaginatedVehicleEntity } from '../../application/vehicles/entities/synced-vehicle.entity';
import { GetVehiclesArgs } from '../../application/vehicles/inputs/get-vehicles.input';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => PaginatedVehicleEntity)
  getVehiclesByAdvancedSearch(
    @Args() args: GetVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getVehiclesByAdvancedSearch(args);
  }
}
