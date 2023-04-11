import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { USER_AGENT } from '../../shared/dtos/puppeteer.contant';
import {
  HTML_DESCRIPTION_CONCESSIONARIE,
  HTML_DESCRIPTION_USED,
  OR,
} from '../vehicles/constants/neoauto.constants';

@Injectable()
export class NeoautoService {
  constructor(private readonly envConfigService: EnvConfigService) {}

  async getVehicles(page: PuppeteerPage, cleanSearch: string) {
    const { url } = this.envConfigService.neoauto();
    const searchPath = cleanSearch.replace(/\s+/g, '+');
    const searchWords = searchPath.split('+');
    const neoautoUrl = `${url}/venta-de-autos?busqueda=${searchPath}&ord_price=0`;

    await page.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: `${url}/venta-de-autos`,
    });

    await page.goto(neoautoUrl, { timeout: 0 });

    const html: string = await page.content();
    const $: CheerioAPI = cheerio.load(html);

    const vehicleList: Cheerio<CheerioElement> = $('div.s-results')
      .find('article')
      .slice(1);

    for (const vehicleBlock of vehicleList) {
      const vehicleDescription = $(vehicleBlock)
        .find(HTML_DESCRIPTION_CONCESSIONARIE + OR + HTML_DESCRIPTION_USED)
        .text()
        .toLowerCase();
      if (!this.includesAll(vehicleDescription, searchWords)) {
        break;
      }
      console.log('neoauto: ', vehicleDescription);
    }
  }

  includesAll(text: string, words: string[]): boolean {
    return words.every((word) => text.includes(word));
  }
}
