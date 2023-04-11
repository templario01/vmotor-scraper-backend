import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { USER_AGENT } from '../../shared/dtos/puppeteer.contant';
import {
  HTML_DESCRIPTION_CONCESSIONARIE,
  HTML_DESCRIPTION_USED,
  HTML_IMAGE_CONCESSIONARIE,
  HTML_IMAGE_USED,
  HTML_URL_CONCESSIONARIE,
  HTML_URL_USED,
  OR,
} from '../vehicles/constants/neoauto.constants';
import { includesAll } from '../../shared/utils/vehicle.utils';
import { NeoAutoSyncService } from '../../jobs/services/neo-auto-sync.service';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { PriceCurrency } from '../vehicles/dtos/vehicle.enums';
import { getVehicleInfoByNeoauto } from '../../shared/utils/neoauto.utils';
import { SearchNeoautoVehicleDto } from './neoauto.dto';

@Injectable()
export class NeoautoService {
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
  ) {}

  async searchNeoautoVehicles(
    page: PuppeteerPage,
    cleanSearch: string,
  ): Promise<VehicleEntity[]> {
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

    return this.getVehiclesByHtml({ $html: $, searchWords, url });
  }

  async getVehiclesByHtml(data: SearchNeoautoVehicleDto) {
    const { $html, searchWords, url } = data;
    const vehicleList: Cheerio<CheerioElement> = $html('div.s-results')
      .find('article')
      .slice(1);
    const neoautoVehicles: VehicleEntity[] = [];

    for (const vehicleBlock of vehicleList) {
      const vehiclePrice = this.neoautoSyncService.getPriceFromHtmlBlock(
        $html,
        vehicleBlock,
      );
      const vehicleDescription = $html(vehicleBlock)
        .find(HTML_DESCRIPTION_CONCESSIONARIE + OR + HTML_DESCRIPTION_USED)
        .text()
        .toLowerCase();

      const vehicleHtmlImage = $html(vehicleBlock).find(
        HTML_IMAGE_CONCESSIONARIE + OR + HTML_IMAGE_USED,
      );
      const imageUrl = vehicleHtmlImage.attr('data-original');
      const vehicleURL = $html(vehicleBlock)
        .find(HTML_URL_CONCESSIONARIE + OR + HTML_URL_USED)
        .attr('href');

      const { id } = getVehicleInfoByNeoauto(vehicleURL);

      if (!includesAll(vehicleDescription, searchWords)) {
        break;
      }
      neoautoVehicles.push({
        description: vehicleDescription,
        url: `${url}/${vehicleURL}`,
        currency: PriceCurrency.USD,
        price: vehiclePrice,
        frontImage: imageUrl,
        externalId: id,
      });
    }

    return neoautoVehicles;
  }
}
