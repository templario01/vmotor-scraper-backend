import { Injectable, Logger } from '@nestjs/common';
import { NeoAutoSyncService } from './neo-auto-sync.service';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import { EnvConfigService } from '../../config/env-config.service';
import { HttpService } from '@nestjs/axios';
import {
  EphemeralProxyResponse,
  Proxy,
} from '../../shared/dtos/ephemeral-proxy.response';
import { Environment } from '../../config/dtos/config.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InventorySyncService {
  private readonly logger: Logger;
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly httpService: HttpService,
  ) {
    this.logger = new Logger(InventorySyncService.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncAllInventory() {
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment === Environment.PROD) {
      const { host, port } = await this.getProxy();
      proxyIP = `${host}:${port}`;
    }
    await Promise.all([
      this.neoautoSyncService.syncNeoautoNewInventory(proxyIP),
      this.neoautoSyncService.syncNeoautoUsedInventory(proxyIP),
      this.mercadolibreSyncService.syncMercadolibreInventory(proxyIP),
    ]);
  }

  async getProxy(): Promise<Proxy> {
    const { url: API_URL, apiKey, host } = this.envConfigService.ephemeralProxiesApiUrl();
    const {
      data: { proxy },
    } = await this.httpService.axiosRef.get<EphemeralProxyResponse>(API_URL, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
      },
    });

    return proxy;
  }
}
