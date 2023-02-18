import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/enums/vehicle.enums';

@Injectable()
export class NeoAutoSyncService {
  private readonly logger: Logger;
  constructor(private readonly config: EnvConfigService) {
    this.logger = new Logger(NeoAutoSyncService.name);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncNewCars() {
    const NEOAUTO_URL = this.config.neoauto().url;
    const vehicleCondition = NeoautoVehicleConditionEnum.NEW;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const currentPages = await this.getPages(vehicleCondition);

    for (let index = 1; index <= currentPages; index++) {
      await page.goto(
        `${NEOAUTO_URL}/venta-de-autos-${vehicleCondition}?page=${index}`,
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
            const vehicleURL = $(element)
              .find('a.c-results-concessionaire__link')
              .attr('href');

            const vehiclePage = await browser.newPage();
            await vehiclePage.goto(`${NEOAUTO_URL}/${vehicleURL}`, {
              timeout: 0,
            });
            const vehicleHtml = await vehiclePage.content();
            const $vehicle = cheerio.load(vehicleHtml);

            const vehicleName = $vehicle(
              'div.c-slider-ficha-detail div.c-slider-ficha-detail__content-child h1.c-slider-ficha-detail__title',
            );

            console.log(vehicleName.html());
          }
        }),
      );
    }

    await browser.close();
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
