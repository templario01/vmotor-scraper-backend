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
import { VehicleSyncService } from '../../application/vehicles/vehicle-sync.service';
@Resolver()
export class VehicleResolver {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly vehicleSyncService: VehicleSyncService,
  ) {}

  @Query(() => PaginatedVehicleEntity)
  getVehiclesByAdvancedSearch(
    @Args() args: GetVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.vehicleService.getVehiclesByAdvancedSearch(args);
  }

  @Query(vehicleSearchEntityReturnType)
  getVehiclesByWebsites(
    @Args('searchName') searchName?: string,
  ): Promise<VehicleSearchEntity> {
    return this.vehicleSyncService.getVehiclesFromWebsites(searchName);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncNeoautoInvetory(
    @Args('syncInvetoryInput')
    input: SyncInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncNeoautoInventory(input);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncMercadolibreInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncMercadolibreInventory();
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncAutocosmosInvetory(
    @Args('syncInvetoryInput')
    input: SyncInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncAutocosmosInventory(input);
  }

  @Mutation(syncBrandsJobEntityReturnType)
  syncInventoryBrands(): Promise<SyncBrandsJobEntity> {
    return this.vehicleSyncService.syncInventoryBrands();
  }
}
