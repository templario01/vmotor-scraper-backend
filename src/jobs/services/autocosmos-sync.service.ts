import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { Cheerio, CheerioAPI, Element as CheerioElement } from 'cheerio';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';
import { USER_AGENT } from '../../shared/dtos/puppeteer.constant';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import { getExternalId, getPages } from '../../shared/utils/autocosmos.utils';
import { AutocosmosVehicleConditionEnum } from '../../application/autocosmos/enums/atocosmos.enum';
import { getEnumKeyByValue } from '../../shared/utils/neoauto.utils';
import {
  PriceCurrency,
  VehicleCondition,
} from '../../application/vehicles/dtos/vehicle.enums';
import { CreateVehicleDto } from '../../application/vehicles/dtos/create-vehicle.dto';
import { formatLocation, getMileage } from '../../shared/utils/vehicle.utils';

@Injectable()
export class AutocosmosSyncService {
  private readonly logger = new Logger(MercadolibreSyncService.name);
  private readonly AUTOCOSMOS: string;
  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {
    this.AUTOCOSMOS = this.config.autocosmos().url;
  }

  async syncInventory(
    vehicleCondition: AutocosmosVehicleConditionEnum,
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

      for (let index = 1; index < currentPages; index++) {
        await page.goto(`${currentUrl}?pidx=${index}`, { timeout: 0 });

        const html: string = await page.content();
        const $: CheerioAPI = cheerio.load(html);
        const vehiclesBlocks: Cheerio<CheerioElement> = $('div.listing-container').find(
          'article',
        );

        for (const vehicleHtmlBlock of vehiclesBlocks) {
          try {
            const vehicleDescription = $(vehicleHtmlBlock).find('a').attr('title');
            const figure = $(vehicleHtmlBlock)
              .find('a figure.listing-card__image img')
              .attr('content');
            const path = $(vehicleHtmlBlock).find('a').attr('href');
            const vehiclePrice = $(vehicleHtmlBlock)
              .find(
                'a div.listing-card__content div.listing-card__offer span.listing-card__price span.listing-card__price-value',
              )
              .attr('content');
            const vehicleYear = $(vehicleHtmlBlock)
              .find(
                'a div.listing-card__content div.listing-card__info span.listing-card__year',
              )
              .html();
            const mileageHtml = $(vehicleHtmlBlock)
              .find(
                'a div.listing-card__content div.listing-card__info span.listing-card__km',
              )
              .html();
            const locationCity = $(vehicleHtmlBlock)
              .find(
                'a div.listing-card__content div.listing-card__offer div.listing-card__location span span.listing-card__city',
              )
              .html();
            const locationRegion = $(vehicleHtmlBlock)
              .find(
                'a div.listing-card__content div.listing-card__offer div.listing-card__location span span.listing-card__province',
              )
              .html();

            const location =
              locationCity && locationRegion
                ? formatLocation(`${locationCity}, ${locationRegion}`)
                : undefined;
            const year = +vehicleYear || null;
            const externalId = getExternalId(path);
            const url = `${this.AUTOCOSMOS}${path}`;

            const vehicleInfo: CreateVehicleDto = {
              websiteId: currentWebsite.id,
              vehicle: {
                externalId,
                url,
                description: vehicleDescription,
                location,
                frontImage: figure,
                price: +vehiclePrice,
                originalPrice: +vehiclePrice,
                currency: PriceCurrency.USD,
                mileage:
                  vehicleCondition === AutocosmosVehicleConditionEnum.USED
                    ? getMileage(mileageHtml)
                    : 0,
                year:
                  vehicleCondition === AutocosmosVehicleConditionEnum.NEW
                    ? new Date().getFullYear()
                    : year,
                condition:
                  vehicleCondition === AutocosmosVehicleConditionEnum.NEW
                    ? VehicleCondition.NEW
                    : VehicleCondition.USED,
              },
            };
            const carSynced = await this.vehicleRepository.upsert(vehicleInfo);
            if (carSynced) {
              syncedVehiclesIds.push(carSynced.externalId);
              this.logger.verbose(`[${condition} CAR] Vehicle synced: ${carSynced?.url}`);
            }
          } catch (error) {
            this.logger.error('fail to sync vehicle', error);
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

  private async getPages(condition: string): Promise<number> {
    const browser: Browser = await puppeteer.launch();
    const puppeteerPage: Page = await browser.newPage();

    await puppeteerPage.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: this.AUTOCOSMOS,
    });
    await puppeteerPage.goto(`${this.AUTOCOSMOS}/auto/${condition}`, {
      timeout: 0,
    });
    const html: string = await puppeteerPage.content();
    const $: CheerioAPI = cheerio.load(html);

    const totalVehicles = $(
      'div.filtros-section-container section.m-with-filters header strong',
    ).html();
    const vehicles = getPages(Number(totalVehicles));
    await browser.close();

    return vehicles;
  }

  private async getSyncConfig(
    vehicleCondition: AutocosmosVehicleConditionEnum,
    proxy?: string,
  ) {
    const condition = getEnumKeyByValue(
      AutocosmosVehicleConditionEnum,
      vehicleCondition,
    ) as VehicleCondition;
    const hostname = new URL(this.AUTOCOSMOS).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentPages = await this.getPages(vehicleCondition);
    const currentUrl = `${this.AUTOCOSMOS}/auto/${vehicleCondition}`;
    const proxyServer = proxy ? [`'--proxy-server=${proxy}`] : [];

    return { condition, currentUrl, currentPages, proxyServer, currentWebsite };
  }
}
