import { Args, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/vehicle.service';
import { PaginatedVehicleEntity } from '../../application/vehicles/entities/synced-vehicle.entity';
import { GetVehiclesArgs } from '../../application/vehicles/inputs/get-vehicles.input';
import { UseGuards } from '@nestjs/common';
import { LoggedUser } from '../../application/auth/guards/logged-user.guard';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => PaginatedVehicleEntity)
  @UseGuards(LoggedUser)
  getVehiclesByAdvancedSearch(
    @Args() args: GetVehiclesArgs,
    @CurrentUser() user: SessionData,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getVehiclesByAdvancedSearch(args, user?.sub);
  }
}

/* const searchs = [
  { searchId: 1, createdAt: '', words: ['mazda', '3'], year: 2018 },
  { searchId: 2, createdAt: '', words: ['nissan', 'sentra'] },
  { searchId: 3, createdAt: '', words: ['toyota'], year: 2014 },
  { searchId: 4, createdAt: '', words: ['mazda', '2'] },
  { searchId: 4, createdAt: '', words: ['mazda', '3'] },
];

const completeSearchs = [
  { searchId: 3, createdAt: '', words: ['toyota'], year: 2014 },
  { searchId: 1, createdAt: '', words: ['mazda', '3'], year: 2018 },
];
const words = ['mazda', '3', 'nissan', 'sentra', 'toyota'];
 */
