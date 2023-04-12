import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { USER_AGENT } from '../../shared/dtos/puppeteer.contant';
import { includesAll } from '../../shared/utils/vehicle.utils';

@Injectable()
export class MercadolibreService {
  constructor(private readonly envConfigService: EnvConfigService) {}

  async searchMercadolibreVehicles(browser: PuppeteerBrowser, cleanSearch: string) {
    const page: PuppeteerPage = await browser.newPage();
    const { url } = this.envConfigService.mercadolibre();
    const searchPath = cleanSearch.replace(/\s+/g, '-');
    const searchWords = searchPath.split('-');
    const mercadolibreUrl = `${url}/vehiculos/${searchPath}_OrderId_PRICE_NoIndex_True`;

    await page.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: `${url}/vehiculos`,
    });

    await page.goto(mercadolibreUrl, { timeout: 0 });

    const html: string = await page.content();
    const $: CheerioAPI = cheerio.load(html);

    const vehicleList: Cheerio<CheerioElement> = $('li.ui-search-layout__item');

    for (const vehicleBlock of vehicleList) {
      const vehicleUrlBlock = $(vehicleBlock).find('div.ui-search-item__group a');
      const vehicleName = vehicleUrlBlock.attr('title');
      const vehicleYear = $(vehicleBlock)
        .find(
          'div.ui-search-item__group ul.ui-search-card-attributes li.ui-search-card-attributes__attribute',
        )
        .html();

      const vehicleDescription = `${vehicleName?.toLowerCase() ?? ''} ${
        vehicleYear?.trim().toLowerCase() ?? ''
      }`;
      if (!includesAll(vehicleDescription, searchWords)) {
        break;
      }
      console.log('mercadolibre:', vehicleDescription);
    }

    return [];
  }
}
