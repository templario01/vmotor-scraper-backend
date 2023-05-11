import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { Cheerio, Element as CheerioElement } from 'cheerio';

import { Browser, Page } from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import {
  convertToNumber,
  getMultiplesOfFortyEight,
  parsePrice,
} from '../../shared/utils/mercado-libre.utils';
import { USER_AGENT } from '../../shared/dtos/puppeteer.constant';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../application/vehicles/dtos/create-vehicle.dto';
import {
  PriceCurrency,
  VehicleCondition,
} from '../../application/vehicles/enums/vehicle.enums';
import { SyncMercadolibreVehicle } from '../../application/mercadolibre/dtos/mercadolibre-sync.dto';
import { Vehicle } from '@prisma/client';
import { CurrencyConverterApiService } from '../../application/currency-converter-api-v1/currency-converter.service';
import { formatLocation } from '../../shared/utils/vehicle.utils';

const PRICE_LIMIT_PEN = 4500;
const PRICE_LIMIT_USD = 1500;

@Injectable()
export class MercadolibreSyncService {
  private readonly logger: Logger;
  private readonly MERCADOLIBRE_URL: string;
  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly currencyConverterService: CurrencyConverterApiService,
    private readonly envConfigService: EnvConfigService,
  ) {
    this.logger = new Logger(MercadolibreSyncService.name);
    this.MERCADOLIBRE_URL = this.config.mercadolibre().url;
  }

  async syncInventory(proxy?: string): Promise<void> {
    try {
      const syncedVehiclesIds = [];
      const { proxyServer, pages, websiteId } = await this.getSyncConfig(proxy);
      const exchangeRate = await this.currencyConverterService.convertCurrency({
        from: PriceCurrency.PEN,
        to: PriceCurrency.USD,
      });
      const exchangeValue = exchangeRate
        ? exchangeRate.new_amount
        : this.envConfigService.exchangeRate().penToUsd;

      const browser: Browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', ...proxyServer],
      });
      const page: Page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': USER_AGENT,
        Referer: `${this.MERCADOLIBRE_URL}/autos/autos-camionetas/`,
      });

      for (const vehicleNumber of pages) {
        const paginationLimit = vehicleNumber !== 1 ? `_Desde_${vehicleNumber}_` : '_';

        await page.goto(
          `${this.MERCADOLIBRE_URL}/autos/autos-camionetas${paginationLimit}OrderId_PRICE_NoIndex_True`,
          { timeout: 0 },
        );
        await page.evaluate(this.scrollToEndOfPage);
        const html = await page.content();
        const $ = cheerio.load(html);

        const vehicleBlocks: Cheerio<CheerioElement> = $('li.ui-search-layout__item');

        for (const vehicleBlock of vehicleBlocks) {
          const priceHtml = $(vehicleBlock).find(
            'div.ui-search-price div.ui-search-price__second-line span.price-tag span.price-tag-amount span.price-tag-fraction',
          );
          const tagPriceHtml = $(vehicleBlock).find(
            'div.ui-search-price div.ui-search-price__second-line span.price-tag span.price-tag-amount span.price-tag-symbol',
          );
          const tagPrice = tagPriceHtml.html().trim();
          const price = parsePrice(priceHtml.html());
          let syncedVehicle: Vehicle;

          if (tagPrice === 'S/' && price >= PRICE_LIMIT_PEN) {
            syncedVehicle = await this.SyncVehicleByCurrency(
              {
                parentHtml: $,
                currency: PriceCurrency.PEN,
                websiteId,
                vehicleBlock,
                price,
              },
              exchangeValue,
            );
          } else if (tagPrice === 'U$S' && price >= PRICE_LIMIT_USD) {
            syncedVehicle = await this.SyncVehicleByCurrency({
              parentHtml: $,
              currency: PriceCurrency.USD,
              websiteId,
              vehicleBlock,
              price,
            });
          }

          if (syncedVehicle) {
            syncedVehiclesIds.push(syncedVehicle.externalId);
            this.logger.verbose(`[USED CAR] Vehicle synced: ${syncedVehicle?.url}`);
          }
        }
      }
      const deletedCars = await this.vehicleRepository.updateStatusForAllInventory({
        vehicleCondition: VehicleCondition.USED,
        syncedVehiclesIds,
        websiteId,
      });
      this.logger.log(
        `[USED CARS] Job to sync vehicles finished successfully, deleted cars: ${deletedCars.count}`,
      );
      await browser.close();
    } catch (error) {
      this.logger.error('fail to sync all inventory', error);
    }
  }

  async SyncVehicleByCurrency(
    { parentHtml, vehicleBlock, websiteId, price, currency }: SyncMercadolibreVehicle,
    exchangeValue?: number,
  ): Promise<Vehicle> {
    try {
      const vehicleUrlBlock = parentHtml(vehicleBlock).find(
        'div.ui-search-item__group a',
      );
      const vehicleUrl = vehicleUrlBlock.attr('href');
      const [, firstPath] = vehicleUrl.trim().split('MPE-');
      const [id] = firstPath.split('-');
      const description = vehicleUrlBlock.attr('title');
      const vehicleImage = parentHtml(vehicleBlock).find(
        'div.slick-track div.slick-slide img',
      );
      const vehicleImageUrl = vehicleImage.attr('src');
      const year = parentHtml(vehicleBlock).find(
        'div.ui-search-item__group ul.ui-search-card-attributes li.ui-search-card-attributes__attribute',
      );
      const mileage = parentHtml(vehicleBlock)
        .find(
          'div.ui-search-item__group ul.ui-search-card-attributes li.ui-search-card-attributes__attribute',
        )
        .next();
      const location = parentHtml(vehicleBlock)
        .find('div.ui-search-item__group--location span')
        .html();

      const createVehicle: CreateVehicleDto = {
        vehicle: {
          externalId: id,
          url: vehicleUrl,
          location: formatLocation(location.replace('-', ',')),
          frontImage: vehicleImageUrl.trim(),
          condition: VehicleCondition.USED,
          year: +year.html(),
          description,
          mileage: convertToNumber(mileage.html()),
          originalPrice: price,
          price: exchangeValue ? price * exchangeValue : price,
          currency,
        },
        websiteId,
      };

      return this.vehicleRepository.upsert(createVehicle);
    } catch (error) {
      this.logger.error(`fail to sync vehicle, `, error);
    }
  }

  private async scrollToEndOfPage() {
    await new Promise<void>((resolve) => {
      const step = 300;
      let lastHeight = 0;
      const interval = setInterval(() => {
        const { scrollHeight } = document.body;
        let scrolled = lastHeight;
        window.scrollBy(0, step);
        scrolled += step;
        if (
          scrolled >= scrollHeight ||
          scrollHeight - window.scrollY <= window.innerHeight + step
        ) {
          clearInterval(interval);
          setTimeout(resolve, 100);
        } else {
          lastHeight = scrolled;
        }
      }, 200);
    });
  }

  async getPages(): Promise<number> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `${this.MERCADOLIBRE_URL}/autos/autos-camionetas/_OrderId_PRICE_NoIndex_True`,
      { timeout: 0 },
    );
    const html = await page.content();
    const $ = cheerio.load(html);

    const pages = $('li.andes-pagination__page-count');
    const totalPages = pages.html().split('>')[1].trim();

    await browser.close();

    return +totalPages;
  }

  private async getSyncConfig(proxy?: string) {
    const proxyServer = proxy ? [`'--proxy-server=${proxy}`] : [];
    const totalPages = await this.getPages();
    const hostname = new URL(this.MERCADOLIBRE_URL).hostname;
    const [, name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const pages = getMultiplesOfFortyEight(totalPages);

    return {
      websiteId: currentWebsite.id,
      pages,
      proxyServer,
    };
  }
}
