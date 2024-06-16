import { Cheerio, CheerioAPI, Element as CheerioElement } from 'cheerio';
import * as cheerio from 'cheerio';
import { Browser as PuppeteerBrowser, Page } from 'puppeteer';
import { AutocosmosCondition } from './enums/autocosmos.enum';
import { PriceCurrency } from '../../shared/enums/currency.enum';
import { getExternalId, getPages } from './utils/autocosmos.utils';
import {
  formatLocation,
  getEnumKeyByValue,
  getMileage,
} from '../../shared/utils/extract-vehicle-data';
import { USER_AGENT } from '../../shared/puppeteer/puppeteer.constants';
import { SyncAutocosmosVehicle } from './types/autocosmos.types';
import { Vehicle } from '@prisma/client';
import { getDurationTime } from '../../shared/utils/time';
import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../shared/dtos/vehicle.dto';
import { Condition } from '../../application/vehicles/enums/vehicle.enums';

@Injectable()
export class AutocosmosSyncService {
  private readonly logger = new Logger(AutocosmosSyncService.name);
  private readonly AUTOCOSMOS_URL: string;

  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {
    this.AUTOCOSMOS_URL = this.config.autocosmos().url;
  }

  async syncAll(
    browser: PuppeteerBrowser,
    vehicleCondition: AutocosmosCondition,
  ): Promise<void> {
    try {
      const startTime = new Date();
      const syncedVehiclesIds: string[] = [];
      const { condition, currentUrl, currentWebsite } = await this.getSyncConfig(
        vehicleCondition,
      );
      const totalPages = await this.getPages(browser, vehicleCondition);

      const page: Page = await browser.newPage();

      for (let currentPage = 1; currentPage < totalPages; currentPage++) {
        await page.goto(`${currentUrl}?pidx=${currentPage}`, { timeout: 0 });

        const html: string = await page.content();
        const $: CheerioAPI = cheerio.load(html);
        const vehiclesBlocks: Cheerio<CheerioElement> = $('div.listing-container').find(
          'article',
        );

        await Promise.all(
          vehiclesBlocks.map(async (_, vehicleHtmlBlock) => {
            try {
              const vehiclePrice = this.extractPrice($, vehicleHtmlBlock);
              const vehicleDescription = this.extractDescription($, vehicleHtmlBlock);
              const imageUrl = this.extractImage($, vehicleHtmlBlock);
              const path = $(vehicleHtmlBlock).find('a').attr('href');
              const vehicleYear = this.extractYear($, vehicleHtmlBlock);
              const mileage = this.extractMileage($, vehicleHtmlBlock, vehicleCondition);
              const location = this.extractLocation($, vehicleHtmlBlock);
              const externalId = getExternalId(path);
              const url = `${this.AUTOCOSMOS_URL}${path}`;
              const name = this.extractName(url);
              const autocosmosVehicle: SyncAutocosmosVehicle = {
                vehiclePrice,
                vehicleDescription,
                imageUrl,
                mileage,
                location,
                vehicleYear,
                externalId,
                vehicleUrl: url,
                websiteId: currentWebsite.id,
                vehicleName: name,
              };
              const carSynced = await this.syncVehicle(
                autocosmosVehicle,
                vehicleCondition,
              );

              if (carSynced) {
                this.logger.verbose(
                  `[${condition} CARS] Vehicle synced: ${carSynced.url}`,
                );
                syncedVehiclesIds.push(carSynced.externalId);
              }
            } catch (error) {
              this.logger.error('fail to sync vehicle', error);
            }
          }),
        );

        const carsSynced = currentPage * vehiclesBlocks.length;
        const percent = Number(((currentPage / totalPages) * 100).toFixed(2));
        this.logger.verbose(
          `[${condition} CARS] total vehicles synchronized = ${carsSynced} (${percent}%)`,
        );
      }
      const deletedCars = await this.vehicleRepository.updateStatusForAllInventory({
        syncedVehiclesIds,
        websiteId: currentWebsite.id,
        vehicleCondition: condition,
      });
      const endTime = new Date();
      const duration = getDurationTime(startTime, endTime);
      this.logger.verbose(
        `[${condition} CARS] Job to sync vehicles finished successfully, deleted cars: ${deletedCars.count}, elapsed time: ${duration}`,
      );
    } catch (error) {
      this.logger.error('fail to sync all inventory', error);
    }
  }

  private extractName(url: string) {
    const urlBrokenInParts = url.split('/');
    const brand = urlBrokenInParts[urlBrokenInParts.length - 4].replace('-', ' ');
    const model = urlBrokenInParts[urlBrokenInParts.length - 3].replace('-', ' ');

    return `${brand} ${model}`;
  }

  private extractPrice(page: CheerioAPI, htmlElement: CheerioElement): number {
    const price = page(htmlElement)
      .find(
        'a div.listing-card__content div.listing-card__offer span.listing-card__price span.listing-card__price-value',
      )
      .attr('content');
    return +price;
  }

  private extractDescription(page: CheerioAPI, htmlElement: CheerioElement): string {
    const description = page(htmlElement).find('a').attr('title');
    return description;
  }

  private extractImage(page: CheerioAPI, htmlElement: CheerioElement): string {
    const image = page(htmlElement)
      .find('a figure.listing-card__image img')
      .attr('content');
    return image;
  }

  private extractYear(page: CheerioAPI, htmlElement: CheerioElement): number {
    const year = page(htmlElement)
      .find('a div.listing-card__content div.listing-card__info span.listing-card__year')
      .html();
    return +year || null;
  }

  private extractMileage(
    page: CheerioAPI,
    htmlElement: CheerioElement,
    vehicleCondition: AutocosmosCondition,
  ): number {
    const mileageHtml = page(htmlElement)
      .find('a div.listing-card__content div.listing-card__info span.listing-card__km')
      .html();
    return vehicleCondition === AutocosmosCondition.USED ? getMileage(mileageHtml) : 0;
  }

  private extractLocation(
    page: CheerioAPI,
    htmlElement: CheerioElement,
  ): string | undefined {
    const locationCity = page(htmlElement)
      .find(
        'a div.listing-card__content div.listing-card__offer div.listing-card__location span span.listing-card__city',
      )
      .html();
    const locationRegion = page(htmlElement)
      .find(
        'a div.listing-card__content div.listing-card__offer div.listing-card__location span span.listing-card__province',
      )
      .html();

    const location =
      locationCity && locationRegion
        ? formatLocation(`${locationCity}, ${locationRegion}`)
        : undefined;
    return location;
  }

  private syncVehicle(
    data: SyncAutocosmosVehicle,
    vehicleCondition: AutocosmosCondition,
  ): Promise<Vehicle> {
    const {
      websiteId,
      externalId,
      vehicleUrl,
      vehicleDescription,
      location,
      imageUrl,
      vehiclePrice,
      mileage,
      vehicleYear,
      vehicleName,
    } = data;
    const vehicleInfo: CreateVehicleDto = {
      websiteId: websiteId,
      vehicle: {
        name: vehicleName,
        externalId,
        url: vehicleUrl,
        description: vehicleDescription,
        location,
        frontImage: imageUrl,
        price: vehiclePrice,
        originalPrice: vehiclePrice,
        currency: PriceCurrency.USD,
        mileage,
        year:
          vehicleCondition === AutocosmosCondition.NEW
            ? new Date().getFullYear()
            : vehicleYear,
        condition:
          vehicleCondition === AutocosmosCondition.NEW ? Condition.NEW : Condition.USED,
      },
    };
    return this.vehicleRepository.upsert(vehicleInfo);
  }

  async getPages(browser: PuppeteerBrowser, condition: string): Promise<number> {
    const puppeteerPage: Page = await browser.newPage();

    await puppeteerPage.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: this.AUTOCOSMOS_URL,
    });
    await puppeteerPage.goto(`${this.AUTOCOSMOS_URL}/auto/${condition}`, {
      timeout: 0,
    });
    const html: string = await puppeteerPage.content();
    const $: CheerioAPI = cheerio.load(html);

    const totalVehicles = $('section.m-with-filters')
      .find('header')
      .find('strong')
      .html();
    const pages = getPages(Number(totalVehicles));

    return pages;
  }

  private async getSyncConfig(vehicleCondition: AutocosmosCondition) {
    const condition = getEnumKeyByValue(
      AutocosmosCondition,
      vehicleCondition,
    ) as Condition;
    const hostname = new URL(this.AUTOCOSMOS_URL).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentUrl = `${this.AUTOCOSMOS_URL}/auto/${vehicleCondition}`;

    return { condition, currentUrl, currentWebsite };
  }
}
