import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/enums/vehicle.enums';
import { NeoAutoDto } from '../../application/vehicles/dtos/requests/neoauto.dto';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';

@Injectable()
export class NeoAutoSyncService {
  private readonly logger: Logger;
  private readonly NEOAUTO_URL: string;
  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
  ) {
    this.logger = new Logger(NeoAutoSyncService.name);
    this.NEOAUTO_URL = this.config.neoauto().url;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncNewCars() {
    const hostname = new URL(this.NEOAUTO_URL).hostname;
    const [name] = hostname.split('.');
    const currentWebsite = await this.websiteRepository.findByName(name);
    const vehicleCondition = NeoautoVehicleConditionEnum.NEW;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const currentPages = await this.getPages(vehicleCondition);

    for (let index = 1; index <= currentPages; index++) {
      await page.goto(
        `${this.NEOAUTO_URL}/venta-de-autos-${vehicleCondition}?page=${index}`,
        { timeout: 0 },
      );

      const html = await page.content();
      const $ = cheerio.load(html);

      const vehicleBlock = $('.c-results-concessionaire');

      await Promise.all(
        vehicleBlock.map(async (_, element) => {
          const price =
            $(element)
              .find(
                'div.c-results-concessionaire-content div.c-results-concessionaire__contact ' +
                  'p.c-results-concessionaire__price strong.c-results-concessionaire__price--black',
              )
              .html() || 'consultar';

          if (!price.toLowerCase().includes('consultar')) {
            await this.syncInfoForNewVehicle(
              browser,
              $,
              element,
              currentWebsite.id,
            );
          }
        }),
      );
    }

    await browser.close();
  }

  async syncInfoForNewVehicle(
    browser: puppeteer.Browser,
    $: cheerio.CheerioAPI,
    element: cheerio.Element,
    websiteId?: number,
  ) {
    const frontImage = $(element)
      .find(
        'div.c-results-concessionaire__slider div.c-gallery figure.c-gallery__images a img',
      )
      .attr('src');
    const vehicleURL = $(element)
      .find('a.c-results-concessionaire__link')
      .attr('href');

    const parts = vehicleURL.split('/');
    const lastPart = parts[parts.length - 1];
    const regex = /^([a-z]+)-([\w-]+)-(\d+)$/i;
    const [, brand, model, id] = lastPart.match(regex) || [];

    const vehicle: NeoAutoDto = {
      externalId: id,
      frontImage: frontImage.trim(),
      url: `${this.NEOAUTO_URL}/${vehicleURL.trim()}`,
    };

    console.log(vehicle, brand, model);

    const vehiclePage = await browser.newPage();
    await vehiclePage.goto(`${this.NEOAUTO_URL}/${vehicleURL}`, {
      timeout: 0,
    });
    const vehicleHtml = await vehiclePage.content();
    const $vehicle = cheerio.load(vehicleHtml);

    const vehicleDescription = $vehicle(
      'div.c-slider-ficha-detail div.c-slider-ficha-detail__content-child h1.c-slider-ficha-detail__title',
    );
    const vehicleYear = $vehicle('ul.c-table__column li.c-table__cell strong');
    const vehiclePrice = vehicleYear.next();
    const vehiclePriceParsed = vehiclePrice.html().trim().toLowerCase();

    vehicle.year = parseInt(vehicleYear.html().trim());
    vehicle.description = vehicleDescription.html().trim();

    if (
      vehiclePriceParsed.includes('$') ||
      vehiclePriceParsed.includes('u$s') ||
      vehiclePriceParsed.includes('usd')
    ) {
      vehicle.usdPrice = Number(
        vehiclePriceParsed.replace(/\$|u\$s|usd/g, '').trim(),
      );
    }

    console.log(vehicle, brand, model, websiteId);
  }

  async getPages(condition: string) {
    let pages = 1;
    const NEOAUTO_URL = this.config.neoauto().url;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    while (true) {
      await page.goto(
        `${NEOAUTO_URL}/venta-de-autos-${condition}?page=${pages}`,
        { timeout: 0 },
      );

      const html = await page.content();
      const $ = cheerio.load(html);
      const cards = $(
        '.c-results-concessionaire div.c-results-concessionaire-content',
      );

      if (cards.html() === null) break;

      pages++;
    }

    await browser.close();

    return pages - 1;
  }
}
