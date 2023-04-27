import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/vehicle.service';
import { SyncInventoryInput } from '../../application/vehicles/inputs/sync-inventory.input';
import {
  SyncInventoryJobEntity,
  syncInventoryJobEntityReturnType,
} from '../../application/vehicles/entities/sync-inventory-job.entity';
import {
  SyncBrandsJobEntity,
  syncBrandsJobEntityReturnType,
} from '../../application/vehicles/entities/sync-brands-job.entity';
import {
  VehicleSearchEntity,
  vehicleSearchEntityReturnType,
} from '../../application/vehicles/entities/vehicle-search.entity';
import { PaginatedVehicleEntity } from '../../application/vehicles/entities/synced-vehicle.entity';
import { GetVehiclesArgs } from '../../application/vehicles/inputs/get-vehicles.input';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(vehicleSearchEntityReturnType)
  getVehiclesByWebsites(
    @Args('searchName') searchName?: string,
  ): Promise<VehicleSearchEntity> {
    return this.vehicleService.getVehiclesFromWebsites(searchName);
  }

  @Query(() => PaginatedVehicleEntity)
  getBestVehiclesByWebsites(
    @Args() args: GetVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getBestVehicles(args);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncNeoautoInvetory(
    @Args('syncInvetoryInput')
    input: SyncInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    return this.vehicleService.syncNeoautoInventory(input);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncMercadolibreInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleService.syncMercadolibreInventory();
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncAutocosmosInvetory(
    @Args('syncInvetoryInput')
    input: SyncInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    return this.vehicleService.syncAutocosmosInventory(input);
  }

  @Mutation(syncBrandsJobEntityReturnType)
  syncInventoryBrands(): Promise<SyncBrandsJobEntity> {
    return this.vehicleService.syncInventoryBrands();
  }
}
