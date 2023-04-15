import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/vehicle.service';
import { SyncNeoautoInventoryInput } from '../../application/vehicles/inputs/sync-neoauto-inventory.input';
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
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(vehicleSearchEntityReturnType)
  getVehiclesByWebsites(
    @Args('searchName') searchName?: string,
  ): Promise<VehicleSearchEntity> {
    return this.vehicleService.getVehiclesFromWebsites(searchName);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncNeoautoInvetory(
    @Args('syncNeoautoInvetoryInput')
    input: SyncNeoautoInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    return this.vehicleService.syncNeoautoInventory(input);
  }

  @Mutation(syncInventoryJobEntityReturnType)
  syncMercadolibreInvetory(): Promise<SyncInventoryJobEntity> {
    return this.vehicleService.syncMercadolibreInventory();
  }

  @Mutation(syncBrandsJobEntityReturnType)
  syncInventoryBrands(): Promise<SyncBrandsJobEntity> {
    return this.vehicleService.syncInventoryBrands();
  }
}
