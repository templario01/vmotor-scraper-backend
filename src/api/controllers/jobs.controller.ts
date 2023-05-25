import { Controller, Head } from '@nestjs/common';
import { VehicleSyncService } from '../../application/vehicles/vehicle-sync.service';
import { SyncInventoryDto } from '../../application/vehicles/dtos/sync-invetory.dto';

@Controller('sync-inventory')
export class SyncController {
  constructor(private readonly vehicleSyncService: VehicleSyncService) {}

  @Head()
  syncInventory(): Promise<SyncInventoryDto> {
    return this.vehicleSyncService.syncInventory();
  }
}
