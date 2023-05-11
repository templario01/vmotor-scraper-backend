import { Injectable, Logger } from '@nestjs/common';
import { NeoAutoSyncService } from './neo-auto-sync.service';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDurationTime } from '../../shared/utils/time.utils';
import { AutocosmosSyncService } from './autocosmos-sync.service';
import { AutocosmosVehicleConditionEnum } from '../../application/autocosmos/enums/atocosmos.enum';
import { ProxyService } from '../../application/proxy/proxy.service';
import { NeoautoVehicleConditionEnum } from '../../application/neoauto/enums/neoauto.enum';

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly proxyService: ProxyService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async syncAllInventory() {
    const startTime = new Date();
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment !== Environment.DEV && environment !== Environment.TEST) {
      const proxy = await this.proxyService.getProxy();
      if (proxy) {
        const { host, port } = proxy;
        proxyIP = `${host}:${port}`;
      }
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
