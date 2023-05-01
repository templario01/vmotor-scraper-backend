import { Injectable } from '@nestjs/common';
import { NeoAutoSyncService } from '../../jobs/services/neo-auto-sync.service';
import { SyncInventoryInput } from './inputs/sync-inventory.input';
import { GetVehicleCondition, NeoautoVehicleConditionEnum } from './dtos/vehicle.enums';
import { SyncInventoryJobEntity } from './entities/sync-inventory-job.entity';
import { getDurationTime } from '../../shared/utils/time.utils';
import { BrandsSyncService } from '../../jobs/services/brands-sync.service';
import { SyncBrandsJobEntity } from './entities/sync-brands-job.entity';
import { MercadolibreSyncService } from '../../jobs/services/mercadolibre-sync.service';
import * as puppeteer from 'puppeteer';
import { Browser as PuppeteerBrowser, PuppeteerLaunchOptions } from 'puppeteer';
import { MercadolibreService } from '../mercadolibre/mercadolibre.service';
import { NeoautoService } from '../neoauto/neoauto.service';
import { VehicleSearchEntity } from './entities/vehicle-search.entity';
import { cleanSearchName } from '../../shared/utils/vehicle.utils';
import { AutocosmosSyncService } from '../../jobs/services/autocosmos-sync.service';
import { AutocosmosVehicleConditionEnum } from '../autocosmos/enums/atocosmos.enum';
import { ProxyService } from '../proxy/proxy.service';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';

@Injectable()
export class VehicleSyncService {
  constructor(
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly brandsSyncService: BrandsSyncService,
    private readonly mercadolibreService: MercadolibreService,
    private readonly neoautoService: NeoautoService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly envConfigService: EnvConfigService,
    private readonly proxyService: ProxyService,
  ) {}

  async getVehiclesFromWebsites(inputSearch?: string): Promise<VehicleSearchEntity> {
    const startTime = new Date();
    const cleanSearch = cleanSearchName(inputSearch);
    const { environment } = this.envConfigService.app();
    const config: PuppeteerLaunchOptions = {
      args: [
        "--proxy-server='direct://'",
        '--proxy-bypass-list=*',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
      ],

      ...(environment === Environment.PROD && {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      }),
      headless: true,
    };
    const browser: PuppeteerBrowser = await puppeteer.launch(config);
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

  private async getProxy() {
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

  async syncNeoautoInventory(input: SyncInventoryInput): Promise<SyncInventoryJobEntity> {
    const startTime = new Date();
    const syncPromises: Promise<void>[] = [];
    const proxy = await this.getProxy();
    switch (input.condition) {
      case GetVehicleCondition.NEW:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW, proxy),
        );
        break;
      case GetVehicleCondition.USED:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED, proxy),
        );
        break;
      case GetVehicleCondition.ALL:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW, proxy),
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED, proxy),
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
    const proxy = await this.getProxy();
    await this.mercadolibreSyncService.syncInventory(proxy);
    const endTime = new Date();

    return {
      startTime,
      endTime,
      duration: getDurationTime(startTime, endTime),
    };
  }

  async syncAutocosmosInventory(
    input: SyncInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    const syncPromises: Promise<void>[] = [];
    const startTime = new Date();
    const proxy = await this.getProxy();
    switch (input.condition) {
      case GetVehicleCondition.NEW:
        syncPromises.push(
          this.autocosmosSyncService.syncInventory(
            AutocosmosVehicleConditionEnum.NEW,
            proxy,
          ),
        );
        break;
      case GetVehicleCondition.USED:
        syncPromises.push(
          this.autocosmosSyncService.syncInventory(
            AutocosmosVehicleConditionEnum.USED,
            proxy,
          ),
        );
        break;
      case GetVehicleCondition.ALL:
        syncPromises.push(
          this.autocosmosSyncService.syncInventory(
            AutocosmosVehicleConditionEnum.NEW,
            proxy,
          ),
          this.autocosmosSyncService.syncInventory(
            AutocosmosVehicleConditionEnum.USED,
            proxy,
          ),
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
