import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser as PuppeteerBrowser } from 'puppeteer';
import { ProxyService } from '../proxy/proxy.service';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { getLaunchOptions } from '../../shared/utils/puppeter.utils';
import { plainToInstance } from 'class-transformer';
import { SyncInventoryDto } from './dtos/sync-invetory.dto';
import { AutocosmosSyncService } from '../../jobs/autocosmos/autocosmos-sync.service';
import { AutocosmosCondition } from '../../jobs/autocosmos/enums/autocosmos.enum';
import { MercadolibreSyncService } from '../../jobs/mercadolibre/mercadolibre-sync.service';
import { NeoAutoSyncService } from '../../jobs/neoauto/neoauto-sync.service';

@Injectable()
export class VehicleSyncService {
  private readonly logger = new Logger(VehicleSyncService.name);
  constructor(
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly envConfigService: EnvConfigService,
    private readonly proxyService: ProxyService,
  ) {}

  async syncInventory(): Promise<SyncInventoryDto> {
    this.logger.log('starting with sync proccess...');
    const proxy = await this.getProxy();
    const proxyServer = proxy ? [`'--proxy-server=${proxy}`] : [];
    const { environment } = this.envConfigService.app();
    const options = getLaunchOptions(environment, proxyServer);
    const browser: PuppeteerBrowser = await puppeteer.launch(options);

    Promise.all([
      this.autocosmosSyncService.syncAll(browser, AutocosmosCondition.NEW),
      this.autocosmosSyncService.syncAll(browser, AutocosmosCondition.USED),
      /*       this.neoautoSyncService.syncInventory(browser, NeoautoVehicleConditionEnum.NEW),
      this.neoautoSyncService.syncInventory(browser, NeoautoVehicleConditionEnum.USED),
      this.mercadolibreSyncService.syncInventory(browser), */
    ]).then(() => {
      this.logger.log('sync process finished successfully');
      browser.close();
    });

    return plainToInstance(SyncInventoryDto, <SyncInventoryDto>{
      jobs_started_at: new Date(),
    });
  }

  private async getProxy(): Promise<string | undefined> {
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment !== Environment.DEV) {
      const proxy = await this.proxyService.getProxy();
      if (proxy) {
        const { host, port } = proxy;
        proxyIP = `${host}:${port}`;
      }
    }

    return proxyIP;
  }
}
