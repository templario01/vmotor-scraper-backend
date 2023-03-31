import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { VehicleEntity } from '../entities/vehicle.entity';
import { NeoAutoSyncService } from '../../../jobs/services/neo-auto-sync.service';
import { SyncNeoautoInventoryInput } from '../inputs/sync-neoauto-inventory.input';
import { VehicleCondition } from '../dtos/enums/vehicle.enums';
import { SyncInventoryJobEntity } from '../entities/sync-inventory-job.entity';
import { getDurationTime } from '../../../shared/utils/time.utils';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly neoautoSyncService: NeoAutoSyncService,
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
      case VehicleCondition.NEW:
        syncPromises.push(this.neoautoSyncService.syncNeoautoNewVehicles());
        break;
      case VehicleCondition.USED:
        syncPromises.push(this.neoautoSyncService.syncNeoautoUsedVehicles());
        break;
      case VehicleCondition.ALL:
        syncPromises.push(
          this.neoautoSyncService.syncNeoautoUsedVehicles(),
          this.neoautoSyncService.syncNeoautoUsedVehicles(),
        );
        break;
    }

    await Promise.all(syncPromises);
    const endTime = new Date();

    return {
      startTime,
      endTime,
      durationInMinutes: getDurationTime(startTime, endTime),
    };
  }
}
