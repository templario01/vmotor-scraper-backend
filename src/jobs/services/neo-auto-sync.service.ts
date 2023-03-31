import { Injectable, Logger } from '@nestjs/common';
import { Cheerio, CheerioAPI, Element as CheerioElement } from 'cheerio';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import { Cron } from '@nestjs/schedule';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/enums/vehicle.enums';
import { VehicleSyncDto } from '../../application/vehicles/dtos/requests/neoauto.dto';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import {
  getModelAndYearFromUrl,
  getVehicleInfoByNeoauto,
  parsePrice,
} from '../../shared/utils/neoauto.utils';
import { plainToInstance } from 'class-transformer';
import { BrandsRepository } from '../../persistence/repositories/brands.repository';
import { ModelsRepository } from '../../persistence/repositories/models.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../application/vehicles/dtos/requests/create-vehicle.dto';

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
    const hostname = new URL(this.NEOAUTO_URL).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentPages = await this.getPages(vehicleCondition);
    const browser: Browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page: Page = await browser.newPage();
    console.log(currentPages);

    for (let index = 1; index <= currentPages; index++) {
      await page.goto(
        `${this.NEOAUTO_URL}/venta-de-autos-${vehicleCondition}?page=${index}`,
        { timeout: 0 },
      );

      const html: string = await page.content();
      const $: CheerioAPI = cheerio.load(html);
      const vehiclesBlock: Cheerio<CheerioElement> = $('div.s-results').find('article');

      for (const vehicleHtmlBlock of vehiclesBlock) {
        const vehiclePrice = this.isPriceAvailableInHtmlBlock($, vehicleHtmlBlock);

        if (vehiclePrice !== undefined) {
          const vehicleHtmlImage = $(vehicleHtmlBlock).find(
            'div.c-slider__item figure.c-slider__images a img, div.c-gallery figure.c-gallery__images a img',
          );
          const imageUrl = vehicleHtmlImage.attr('data-original');
          const vehicleURL = $(vehicleHtmlBlock)
            .find('a.c-results-concessionaire__link, a.c-results-use__link')
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
            this.logger.verbose(`Used vehicle synced: ${carSynced?.url}`);
          }
        }
      }
    }
    const deletedCars = await this.vehicleRepository.updateStatusForAllInventory(
      vehiclesSyncedIds,
    );
    this.logger.log(
      `Job to sync used vehicles finished successfully, deleted cars: ${deletedCars.count}`,
    );

    await browser.close();
  }

  async syncVehicle(
    {
      imageUrl,
      vehicleURL,
      vehiclePrice,
      websiteId,
    }: {
      imageUrl?: string;
      vehicleURL?: string;
      vehiclePrice?: number;
      websiteId?: number;
    },
    condition: NeoautoVehicleConditionEnum,
  ) {
    try {
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
      this.logger.error('fail to sync vehicle, ', error);
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

  private isPriceAvailableInHtmlBlock(
    page: CheerioAPI,
    htmlElement: CheerioElement,
  ): number {
    const price: string = page(htmlElement)
      .find(
        'div.c-results-concessionaire-content div.c-results-concessionaire__contact ' +
          'p.c-results-concessionaire__price strong.c-results-concessionaire__price--black' +
          ', div.c-results-used-content div.c-results-used__contact div.c-results-used__price strong.c-results-used__price--black',
      )
      .html();

    if (price === null || price.toLowerCase().includes('consultar')) {
      return undefined;
    }

    return parsePrice(price);
  }
}
