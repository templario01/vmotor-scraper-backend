import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { VehicleEntity } from '../entities/vehicle.entity';
import { NeoAutoSyncService } from '../../../jobs/services/neo-auto-sync.service';
import { SyncNeoautoInventoryInput } from '../inputs/sync-neoauto-inventory.input';
import { GetVehicleCondition, NeoautoVehicleConditionEnum } from '../dtos/vehicle.enums';
import { SyncInventoryJobEntity } from '../entities/sync-inventory-job.entity';
import { getDurationTime } from '../../../shared/utils/time.utils';
import { BrandsSyncService } from '../../../jobs/services/brands-sync.service';
import { SyncBrandsJobEntity } from '../entities/sync-brands-job.entity';
import { MercadolibreSyncService } from '../../../jobs/services/mercadolibre-sync.service';
import * as puppeteer from 'puppeteer';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { MercadolibreService } from '../../mercadolibre/mercadolibre.service';
import { NeoautoService } from '../../neoauto/neoauto.service';
import { AutocosmosService } from '../../autocosmos/autocosmos.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly brandsSyncService: BrandsSyncService,
    private readonly mercadolibreService: MercadolibreService,
    private readonly neoautoService: NeoautoService,
    private readonly autocosmosService: AutocosmosService,
  ) {}

  async findVehicle(brand: string, model: string): Promise<VehicleEntity> {
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

  async findVehicles(inputSearch?: string): Promise<VehicleEntity> {
    const cleanSearch = this.cleanSearchName(inputSearch);
    const browser: PuppeteerBrowser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page: PuppeteerPage = await browser.newPage();

    await this.mercadolibreService.getVehicles(page, cleanSearch);
    await this.neoautoService.getVehicles(page, cleanSearch);
    await this.autocosmosService.getVehicles(page, cleanSearch);

    return null;
  }

  cleanSearchName(word: string): string {
    const caracteresValidos = /[^a-zA-Z0-9]+/g;
    word = word.replace(caracteresValidos, ' ');
    word = word.trim().toLowerCase();

    return word;
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
