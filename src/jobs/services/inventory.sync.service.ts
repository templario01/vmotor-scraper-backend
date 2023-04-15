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
import { getDurationTime } from '../../shared/utils/time.utils';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/vehicle.enums';

const proxyCountries = ['US', 'BR', 'PE'];

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly httpService: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncAllInventory() {
    const startTime = new Date();
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment === Environment.PROD) {
      const { host, port } = await this.getProxy();
      proxyIP = `${host}:${port}`;
    }

    await Promise.all([
      this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW, proxyIP),
      this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED, proxyIP),
      this.mercadolibreSyncService.syncInventory(proxyIP),
    ]);

    const endTime = new Date();
    const duration = getDurationTime(startTime, endTime);

    this.logger.log(`All inventory synced successfully, duration: ${duration}`);
  }

  async getProxy(): Promise<Proxy> {
    const { url: API_URL, host } = this.envConfigService.ephemeralProxiesApi();
    const { apiKey } = this.envConfigService.rapidApi();
    const {
      data: { proxy },
    } = await this.httpService.axiosRef.get<EphemeralProxyResponse>(API_URL, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
      },
      params: {
        countries: proxyCountries.join(','),
      },
    });

    return proxy;
  }
}
