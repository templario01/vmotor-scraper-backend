import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  SyncInventoryJobEntity,
  syncInventoryJobEntityReturnType,
} from '../../application/vehicles/entities/sync-inventory-job.entity';
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

  @Mutation(syncInventoryJobEntityReturnType)
  syncNeoautoInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncNeoautoInventory();
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncMercadolibreInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncMercadolibreInventory();
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncAutocosmosInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleSyncService.syncAutocosmosInventory();
  }
}
