import { Injectable, Logger } from '@nestjs/common';
import { Cheerio, CheerioAPI, Element as CheerioElement } from 'cheerio';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import {
  NeoautoVehicleConditionEnum,
  PriceCurrency,
  VehicleCondition,
} from '../../application/vehicles/dtos/vehicle.enums';

import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import {
  getEnumKeyByValue,
  getModelAndYearFromUrl,
  getVehicleInfoByNeoauto,
  parsePrice,
} from '../../shared/utils/neoauto.utils';
import { BrandsRepository } from '../../persistence/repositories/brands.repository';
import { ModelsRepository } from '../../persistence/repositories/models.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../application/vehicles/dtos/create-vehicle.dto';
import {
  HTML_DESCRIPTION_CONCESSIONARIE,
  HTML_DESCRIPTION_USED,
  HTML_IMAGE_CONCESSIONARIE,
  HTML_IMAGE_USED,
  HTML_PRICE_CONCESSIONAIRE,
  HTML_PRICE_USED,
  HTML_URL_CONCESSIONARIE,
  HTML_URL_USED,
  OR,
} from '../../application/vehicles/constants/neoauto.constants';
import { SyncNeoautoVehicle } from '../../application/vehicles/dtos/neoauto-sync.dto';
import { USER_AGENT } from '../../shared/dtos/puppeteer.constant';
import { Vehicle } from '@prisma/client';

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

  async syncInventory(
    vehicleCondition: NeoautoVehicleConditionEnum,
    proxy?: string,
  ): Promise<void> {
    try {
      const syncedVehiclesIds = [];
      const { condition, currentUrl, currentPages, proxyServer, currentWebsite } =
        await this.getSyncConfig(vehicleCondition, proxy);
      const browser: Browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', ...proxyServer],
      });
      const page: Page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'User-Agent': USER_AGENT,
        Referer: currentUrl,
      });

      for (let index = 1; index <= currentPages; index++) {
        await page.goto(`${currentUrl}?page=${index}`, { timeout: 0 });

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
            const vehicleDescription = $(vehicleHtmlBlock)
              .find(HTML_DESCRIPTION_CONCESSIONARIE + OR + HTML_DESCRIPTION_USED)
              .text();

            const neoautoVehicle: SyncNeoautoVehicle = {
              imageUrl,
              vehiclePrice,
              vehicleURL,
              vehicleDescription,
              websiteId: currentWebsite.id,
            };
            const carSynced = await this.syncVehicle(neoautoVehicle, vehicleCondition);

            if (carSynced) {
              syncedVehiclesIds.push(carSynced.externalId);
              this.logger.verbose(`[${condition} CAR] Vehicle synced: ${carSynced?.url}`);
            }
          }
        }
      }
      const deletedCars = await this.vehicleRepository.updateStatusForAllInventory({
        syncedVehiclesIds,
        websiteId: currentWebsite.id,
        vehicleCondition: condition,
      });
      this.logger.log(
        `[${condition} CARS] Job to sync vehicles finished successfully, deleted cars: ${deletedCars.count}`,
      );

      await browser.close();
    } catch (error) {
      this.logger.error('fail to sync all inventory', error);
    }
  }

  private async syncVehicle(
    data: SyncNeoautoVehicle,
    condition: NeoautoVehicleConditionEnum,
  ): Promise<Vehicle> {
    try {
      const { imageUrl, vehicleURL, vehiclePrice, websiteId, vehicleDescription } = data;
      const { modelWithYear, id } = getVehicleInfoByNeoauto(vehicleURL);
      const { year } = getModelAndYearFromUrl(modelWithYear);

      const vehicleInfo: CreateVehicleDto = {
        vehicle: {
          mileage: 0,
          condition:
            condition === NeoautoVehicleConditionEnum.NEW
              ? VehicleCondition.NEW
              : VehicleCondition.USED,
          externalId: id,
          frontImage: imageUrl,
          description: vehicleDescription,
          url: `${this.NEOAUTO_URL}/${vehicleURL}`,
          price: vehiclePrice,
          currency: PriceCurrency.USD,
          year: +year,
        },
        websiteId,
      };

      return this.vehicleRepository.upsert(vehicleInfo);
    } catch (error) {
      this.logger.error(`fail to sync vehicle, ${data?.vehicleURL || ''}`, error);
    }
  }

  private async getPages(condition: string): Promise<number> {
    const browser: Browser = await puppeteer.launch();
    const puppeteerPage: Page = await browser.newPage();

    await puppeteerPage.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: this.NEOAUTO_URL,
    });
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

  private async getSyncConfig(
    vehicleCondition: NeoautoVehicleConditionEnum,
    proxy?: string,
  ) {
    const condition = getEnumKeyByValue(
      NeoautoVehicleConditionEnum,
      vehicleCondition,
    ) as VehicleCondition;
    const hostname = new URL(this.NEOAUTO_URL).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentPages = await this.getPages(vehicleCondition);
    const currentUrl = `${this.NEOAUTO_URL}/venta-de-autos-${vehicleCondition}`;
    const proxyServer = proxy ? [`'--proxy-server=${proxy}`] : [];

    return {
      condition,
      currentWebsite,
      currentPages,
      currentUrl,
      proxyServer,
    };
  }

  getPriceFromHtmlBlock(page: CheerioAPI, htmlElement: CheerioElement): number {
    const price: string = page(htmlElement)
      .find(HTML_PRICE_CONCESSIONAIRE + OR + HTML_PRICE_USED)
      .html();

    if (price === null || price.toLowerCase().includes('consultar')) {
      return undefined;
    }

    return parsePrice(price);
  }
}
