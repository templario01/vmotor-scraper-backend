import { Injectable, Logger } from '@nestjs/common';
import { NeoAutoSyncService } from './neo-auto-sync.service';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDurationTime } from '../../shared/utils/time.utils';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/vehicle.enums';
import { AutocosmosSyncService } from './autocosmos-sync.service';
import { AutocosmosVehicleConditionEnum } from '../../application/autocosmos/enums/atocosmos.enum';
import { ProxyApiV2Service } from '../../application/proxy-api-v2/proxy-api-v2.service';

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly proxyApiv2Service: ProxyApiV2Service,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncAllInventory() {
    const startTime = new Date();
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment === Environment.PROD) {
      const { host, port } = await this.proxyApiv2Service.getProxy();
      proxyIP = `${host}:${port}`;
    }

    await Promise.all([
      this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW, proxyIP),
      this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED, proxyIP),
      this.autocosmosSyncService.syncInventory(
        AutocosmosVehicleConditionEnum.NEW,
        proxyIP,
      ),
      this.autocosmosSyncService.syncInventory(
        AutocosmosVehicleConditionEnum.USED,
        proxyIP,
      ),
      this.mercadolibreSyncService.syncInventory(proxyIP),
    ]);

    const endTime = new Date();
    const duration = getDurationTime(startTime, endTime);

    this.logger.log(`All inventory synced successfully, duration: ${duration}`);
  }
}
