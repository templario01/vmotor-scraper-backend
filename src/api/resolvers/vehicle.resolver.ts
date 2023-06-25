import { Args, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/vehicle.service';
import {
  PaginatedVehicleEntity,
  typeofPaginatedVehicleEntity,
} from '../../application/vehicles/entities/synced-vehicle.entity';
import { GetVehiclesArgs } from '../../application/vehicles/inputs/get-vehicles.input';
import { UseGuards } from '@nestjs/common';
import { LoggedUser } from '../../application/auth/guards/logged-user.guard';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';
import { AuthGuard } from '../../application/auth/guards/auth.guard';
import { GetRecommendedVehiclesArgs } from '../../application/vehicles/inputs/get-recommended-vehicles.input';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(typeofPaginatedVehicleEntity)
  @UseGuards(LoggedUser)
  getVehiclesByAdvancedSearch(
    @Args() args: GetVehiclesArgs,
    @CurrentUser() user: SessionData,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getVehiclesByAdvancedSearch(args, user?.sub);
  }

  @Query(typeofPaginatedVehicleEntity)
  @UseGuards(AuthGuard)
  getRecommendedVehicles(
    @CurrentUser() user: SessionData,
    @Args() args: GetRecommendedVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getRecommendedVehicles(args, user?.sub);
  }
}
