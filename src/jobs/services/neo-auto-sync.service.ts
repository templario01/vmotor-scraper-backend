import { Injectable, Logger } from '@nestjs/common';
import { Cheerio, CheerioAPI, Element as CheerioElement } from 'cheerio';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import { Cron } from '@nestjs/schedule';
import {
  NeoautoVehicleConditionEnum,
  VehicleCondition,
} from '../../application/vehicles/dtos/enums/vehicle.enums';
import { VehicleSyncDto } from '../../application/vehicles/dtos/requests/neoauto.dto';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import {
  getEnumKeyByValue,
  getModelAndYearFromUrl,
  getVehicleInfoByNeoauto,
  parsePrice,
} from '../../shared/utils/neoauto.utils';
import { plainToInstance } from 'class-transformer';
import { BrandsRepository } from '../../persistence/repositories/brands.repository';
import { ModelsRepository } from '../../persistence/repositories/models.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../application/vehicles/dtos/requests/create-vehicle.dto';
import {
  HTML_IMAGE_CONCESSIONARIE,
  HTML_IMAGE_USED,
  HTML_PRICE_CONCESSIONAIRE,
  HTML_PRICE_USED,
  HTML_URL_CONCESSIONARIE,
  HTML_URL_USED,
  OR,
} from '../../application/vehicles/constants/neoauto.constants';
import { SyncNeoautoVehicle } from '../../application/vehicles/dtos/requests/neoauto-sync.dto';

@Injectable()
export class NeoAutoSyncService {
  private readonly logger = new Logger(NeoAutoSyncService.name);
  private readonly NEOAUTO_URL: string;
  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
    private readonly brandRepository: BrandsRepository,
    private readonly modelRepository: ModelsRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {
    this.NEOAUTO_URL = this.config.neoauto().url;
  }

  @Cron('0 0 * * *')
  async syncNeoautoNewVehicles() {
    await this.syncAllInventory(NeoautoVehicleConditionEnum.NEW);
  }

  @Cron('0 2 */2 * *')
  async syncNeoautoUsedVehicles() {
    await this.syncAllInventory(NeoautoVehicleConditionEnum.USED);
  }

  async syncAllInventory(vehicleCondition: NeoautoVehicleConditionEnum) {
    const vehiclesSyncedIds = [];
    const condition = getEnumKeyByValue(
      NeoautoVehicleConditionEnum,
      vehicleCondition,
    ) as VehicleCondition;
    const hostname = new URL(this.NEOAUTO_URL).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentPages = await this.getPages(vehicleCondition);
    const browser: Browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page: Page = await browser.newPage();

    for (let index = 1; index <= currentPages; index++) {
      await page.goto(
        `${this.NEOAUTO_URL}/venta-de-autos-${vehicleCondition}?page=${index}`,
        { timeout: 0 },
      );

      const html: string = await page.content();
      const $: CheerioAPI = cheerio.load(html);
      const vehiclesBlock: Cheerio<CheerioElement> = $('div.s-results').find('article');

      for (const vehicleHtmlBlock of vehiclesBlock) {
        const vehiclePrice = this.getPriceFromHtmlBlock($, vehicleHtmlBlock);

        if (vehiclePrice !== undefined) {
          const vehicleHtmlImage = $(vehicleHtmlBlock).find(
            HTML_IMAGE_CONCESSIONARIE + OR + HTML_IMAGE_USED,
          );
          const imageUrl = vehicleHtmlImage.attr('data-original');
          const vehicleURL = $(vehicleHtmlBlock)
            .find(HTML_URL_CONCESSIONARIE + OR + HTML_URL_USED)
            .attr('href');

          const carSynced = await this.syncVehicle(
            {
              imageUrl,
              vehiclePrice,
              vehicleURL,
              websiteId: currentWebsite.id,
            },
            vehicleCondition,
          );

          if (carSynced) {
            vehiclesSyncedIds.push(carSynced.externalId);
            this.logger.verbose(`[${condition} CAR] Vehicle synced: ${carSynced?.url}`);
          }
        }
      }
    }
    const deletedCars = await this.vehicleRepository.updateStatusForAllInventory(
      vehiclesSyncedIds,
      condition,
    );
    this.logger.log(
      `[${condition} CARS] Job to sync vehicles finished successfully, deleted cars: ${deletedCars.count}`,
    );

    await browser.close();
  }

  async syncVehicle(data: SyncNeoautoVehicle, condition: NeoautoVehicleConditionEnum) {
    try {
      const { imageUrl, vehicleURL, vehiclePrice, websiteId } = data;
      const { brand, modelWithYear, id } = getVehicleInfoByNeoauto(vehicleURL);
      const { model, year } = getModelAndYearFromUrl(modelWithYear);

      const { id: brandId } = await this.brandRepository.findByName(brand);
      const { id: modelId } = await this.modelRepository.findByNameAndBrandId(
        model,
        brandId,
      );

      const vehicleInfo = plainToInstance(CreateVehicleDto, {
        vehicle: plainToInstance(VehicleSyncDto, {
          mileage: 0,
          condition: condition === NeoautoVehicleConditionEnum.NEW ? 'NEW' : 'USED',
          externalId: id,
          frontImage: imageUrl,
          url: `${this.NEOAUTO_URL}/${vehicleURL}`,
          usdPrice: vehiclePrice,
          year: +year,
        }),
        brandId,
        modelId,
        websiteId,
      });

      return this.vehicleRepository.upsert(vehicleInfo);
    } catch (error) {
      this.logger.error('fail to sync vehicle, ', error, `${data?.vehicleURL || ''}`);
      return undefined;
    }
  }

  async getPages(condition: string): Promise<number> {
    const browser: Browser = await puppeteer.launch();
    const puppeteerPage: Page = await browser.newPage();

    await puppeteerPage.goto(`${this.NEOAUTO_URL}/venta-de-autos-${condition}?page=1`, {
      timeout: 0,
    });
    const html: string = await puppeteerPage.content();
    const $: CheerioAPI = cheerio.load(html);

    const lastPaginationBtn = $('li.c-pagination-content__btn').last().find('a');
    const paginationUrl = lastPaginationBtn.attr('href');
    const [, maxPages] = paginationUrl.split('page=');

    await browser.close();

    return +maxPages;
  }

  private getPriceFromHtmlBlock(page: CheerioAPI, htmlElement: CheerioElement): number {
    const price: string = page(htmlElement)
      .find(HTML_PRICE_CONCESSIONAIRE + OR + HTML_PRICE_USED)
      .html();

    if (price === null || price.toLowerCase().includes('consultar')) {
      return undefined;
    }

    return parsePrice(price);
  }
}
