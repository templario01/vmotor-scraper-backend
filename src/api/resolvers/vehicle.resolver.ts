import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/services/vehicle.service';
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
  VehicleEntity,
  vehiclesEntityeturnType,
} from '../../application/vehicles/entities/vehicle.entity';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(vehiclesEntityeturnType)
  getVehiclesByWebsites(
    @Args('searchName') searchName?: string,
  ): Promise<VehicleEntity[]> {
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
