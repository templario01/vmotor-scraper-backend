import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VehicleService } from '../../application/vehicles/services/vehicle.service';
import {
  VehicleEntity,
  vehicleEntityReturnType,
} from '../../application/vehicles/entities/vehicle.entity';
import { SyncNeoautoInventoryInput } from '../../application/vehicles/inputs/sync-neoauto-inventory.input';
import {
  SyncInventoryJobEntity,
  syncInventoryJobEntityReturnType,
} from '../../application/vehicles/entities/sync-inventory-job.entity';
import {
  SyncBrandsJobEntity,
  syncBrandsJobEntityReturnType,
} from '../../application/vehicles/entities/sync-brands-job.entity';
@Resolver()
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(vehicleEntityReturnType)
  getVehicle(
    @Args('brand') brand: string,
    @Args('model') model?: string,
  ): Promise<VehicleEntity> {
    return this.vehicleService.findVehicle(brand, model);
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
