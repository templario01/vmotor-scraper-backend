import { Injectable } from '@nestjs/common';
import { NeoAutoSyncService } from '../../jobs/services/neo-auto-sync.service';
import { getDurationTime } from '../../shared/utils/time.utils';
import { MercadolibreSyncService } from '../../jobs/services/mercadolibre-sync.service';
import * as puppeteer from 'puppeteer';
import { Browser as PuppeteerBrowser } from 'puppeteer';
import { MercadolibreService } from '../mercadolibre/mercadolibre.service';
import { NeoautoService } from '../neoauto/neoauto.service';
import { VehicleSearchEntity } from './entities/vehicle-search.entity';
import { cleanSearchName } from '../../shared/utils/vehicle.utils';
import { AutocosmosSyncService } from '../../jobs/services/autocosmos-sync.service';
import { AutocosmosVehicleConditionEnum } from '../autocosmos/enums/atocosmos.enum';
import { ProxyService } from '../proxy/proxy.service';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { NeoautoVehicleConditionEnum } from '../neoauto/enums/neoauto.enum';
import { getLaunchOptions } from '../../shared/utils/puppeter.utils';
import { plainToInstance } from 'class-transformer';
import { SyncInventoryDto } from './dtos/sync-invetory.dto';

@Injectable()
export class VehicleSyncService {
  constructor(
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly mercadolibreService: MercadolibreService,
    private readonly neoautoService: NeoautoService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly envConfigService: EnvConfigService,
    private readonly proxyService: ProxyService,
  ) {}

  async syncInventory(): Promise<SyncInventoryDto> {
    const proxy = await this.getProxy();
    const proxyServer = proxy ? [`'--proxy-server=${proxy}`] : [];

    const { environment } = this.envConfigService.app();
    const options = getLaunchOptions(environment, proxyServer);

    const browser: PuppeteerBrowser = await puppeteer.launch(options);

    Promise.all([
      this.neoautoSyncService.syncInventory(browser, NeoautoVehicleConditionEnum.NEW),
      this.neoautoSyncService.syncInventory(browser, NeoautoVehicleConditionEnum.USED),
      this.autocosmosSyncService.syncInventory(
        browser,
        AutocosmosVehicleConditionEnum.NEW,
      ),
      this.autocosmosSyncService.syncInventory(
        browser,
        AutocosmosVehicleConditionEnum.USED,
      ),
      this.mercadolibreSyncService.syncInventory(browser),
    ]).then(() => browser.close());

    return plainToInstance(SyncInventoryDto, <SyncInventoryDto>{
      jobs_started_at: new Date(),
    });
  }

  async getVehiclesFromWebsites(inputSearch?: string): Promise<VehicleSearchEntity> {
    const startTime = new Date();
    const cleanSearch = cleanSearchName(inputSearch);
    const { environment } = this.envConfigService.app();
    const options = getLaunchOptions(environment);

    const browser: PuppeteerBrowser = await puppeteer.launch(options);

    const [mercadolibreVehicles, neoautoVehicles] = await Promise.all([
      this.mercadolibreService.searchMercadolibreVehicles(browser, cleanSearch),
      this.neoautoService.searchNeoautoVehicles(browser, cleanSearch),
    ]);

    const result = [...mercadolibreVehicles, ...neoautoVehicles].sort(
      (vehicleA, vehicleB) => vehicleA.price - vehicleB.price,
    );
    await browser.close();
    const endTime = new Date();

    return {
      duration: getDurationTime(startTime, endTime),
      vehicles: result,
    };
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
