import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { VehicleEntity } from '../entities/vehicle.entity';
import { NeoAutoSyncService } from '../../../jobs/services/neo-auto-sync.service';
import { SyncNeoautoInventoryInput } from '../inputs/sync-neoauto-inventory.input';
import { GetVehicleCondition } from '../dtos/vehicle.enums';
import { SyncInventoryJobEntity } from '../entities/sync-inventory-job.entity';
import { getDurationTime } from '../../../shared/utils/time.utils';
import { BrandsSyncService } from '../../../jobs/services/brands-sync.service';
import { SyncBrandsJobEntity } from '../entities/sync-brands-job.entity';
import { MercadolibreSyncService } from '../../../jobs/services/mercadolibre-sync.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly brandsSyncService: BrandsSyncService,
  ) {}

  async findVehicle(brand: string, model: string): Promise<VehicleEntity> {
    const { mileage, usdPrice, penPrice, ...result } =
      await this.vehicleRepository.findFirst(brand, model);

    return {
      ...result,
      mileage: mileage?.toNumber(),
      usdPrice: usdPrice?.toNumber(),
      penPrice: penPrice?.toNumber(),
    };
  }

  async syncNeoautoInventory(
    input: SyncNeoautoInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    const syncPromises: Promise<void>[] = [];
    const startTime = new Date();
    switch (input.condition) {
      case GetVehicleCondition.NEW:
        syncPromises.push(this.neoautoSyncService.syncNeoautoNewVehicles());
        break;
      case GetVehicleCondition.USED:
        syncPromises.push(this.neoautoSyncService.syncNeoautoUsedVehicles());
        break;
      case GetVehicleCondition.ALL:
        syncPromises.push(
          this.neoautoSyncService.syncNeoautoNewVehicles(),
          this.neoautoSyncService.syncNeoautoUsedVehicles(),
        );
        break;
    }

    await Promise.all(syncPromises);
    const endTime = new Date();

    return {
      startTime,
      endTime,
      duration: getDurationTime(startTime, endTime),
    };
  }

  async syncMercadolibreInventory(): Promise<SyncInventoryJobEntity> {
    const startTime = new Date();
    await this.mercadolibreSyncService.syncInventory();
    const endTime = new Date();

    return {
      startTime,
      endTime,
      duration: getDurationTime(startTime, endTime),
    };
  }

  async syncInventoryBrands(): Promise<SyncBrandsJobEntity> {
    const startTime = new Date();
    await this.brandsSyncService.syncBrands();
    const endTime = new Date();

    return {
      startTime,
      endTime,
      duration: getDurationTime(startTime, endTime),
    };
  }
}
