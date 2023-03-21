import { Args, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/services/vehicle.service';
import { VehicleModel } from '../../application/vehicles/dtos/models/vehicle.model';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => VehicleModel)
  getVehicle(
    @Args('brand') brand: string,
    @Args('model') model?: string,
  ): Promise<VehicleModel> {
    return this.vehicleService.findVehicle(brand, model);
  }
}
