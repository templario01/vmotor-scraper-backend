import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { SyncedVehicleEntity } from './entities/synced-vehicle.entity';
import { NeoAutoSyncService } from '../../jobs/services/neo-auto-sync.service';
import { SyncNeoautoInventoryInput } from './inputs/sync-neoauto-inventory.input';
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
import { AutocosmosService } from '../autocosmos/autocosmos.service';
import { VehicleSearchEntity } from './entities/vehicle-search.entity';
import { cleanSearchName } from '../../shared/utils/vehicle.utils';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly brandsSyncService: BrandsSyncService,
    private readonly mercadolibreService: MercadolibreService,
    private readonly neoautoService: NeoautoService,
    private readonly autocosmosService: AutocosmosService,
  ) {}

  async findVehicle(brand: string, model: string): Promise<SyncedVehicleEntity> {
    const { mileage, price, ...result } = await this.vehicleRepository.findFirst(
      brand,
      model,
    );

    return {
      ...result,
      mileage: mileage?.toNumber(),
      price: price?.toNumber(),
    };
  }

  async getVehiclesFromWebsites(inputSearch?: string): Promise<VehicleSearchEntity> {
    const startTime = new Date();

    const cleanSearch = cleanSearchName(inputSearch);
    const config: PuppeteerLaunchOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process'],
      ...(process.env.NODE_ENV === 'staging' && {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      }),
    };
    const browser: PuppeteerBrowser = await puppeteer.launch(config);

    const [mercadolibreVehicles, neoautoVehicles] = await Promise.all([
      this.mercadolibreService.searchMercadolibreVehicles(browser, cleanSearch),
      this.neoautoService.searchNeoautoVehicles(browser, cleanSearch),
    ]);

    const result = [...mercadolibreVehicles, ...neoautoVehicles].sort(
      (vehicleA, vehicleB) => vehicleA.price - vehicleB.price,
    );
    const endTime = new Date();

    return {
      duration: getDurationTime(startTime, endTime),
      vehicles: result,
    };
  }

  async syncNeoautoInventory(
    input: SyncNeoautoInventoryInput,
  ): Promise<SyncInventoryJobEntity> {
    const syncPromises: Promise<void>[] = [];
    const startTime = new Date();
    switch (input.condition) {
      case GetVehicleCondition.NEW:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW),
        );
        break;
      case GetVehicleCondition.USED:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED),
        );
        break;
      case GetVehicleCondition.ALL:
        syncPromises.push(
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.NEW),
          this.neoautoSyncService.syncInventory(NeoautoVehicleConditionEnum.USED),
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
