import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { USER_AGENT } from '../../shared/dtos/puppeteer.constant';
import { includesAll } from '../../shared/utils/vehicle.utils';

@Injectable()
export class AutocosmosService {
  constructor(private readonly envConfigService: EnvConfigService) {}

  async getVehicles(page: PuppeteerPage, cleanSearch: string) {
    const { url } = this.envConfigService.autocosmos();
    const searchPath = cleanSearch.replace(/\s+/g, '+');
    const searchWords = searchPath.split('+');
    const neoautoUrl = `${url}/auto?q=${searchPath}`;

    await page.setExtraHTTPHeaders({
      'User-Agent': USER_AGENT,
      Referer: `${url}/auto`,
    });

    await page.goto(neoautoUrl, { timeout: 0 });

    const html: string = await page.content();
    const $: CheerioAPI = cheerio.load(html);

    const vehicleList: Cheerio<CheerioElement> = $('div.listing-container').find(
      'article',
    );

    for (const vehicleBlock of vehicleList) {
      const vehicleDescription = $(vehicleBlock).find('a').attr('title').toLowerCase();
      if (!includesAll(vehicleDescription, searchWords)) {
        break;
      }
    }
  }
}
