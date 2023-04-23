import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
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
import { formatAmount } from '../../shared/utils/format-amount.utils';
import { SearchVehicleDto } from '../vehicles/dtos/vehicle.dto';

@Injectable()
export class NeoautoService {
  private readonly NEOAUTO_URL: string;
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
  ) {
    this.NEOAUTO_URL = this.envConfigService.neoauto().url;
  }

  async searchNeoautoVehicles(
    browser: PuppeteerBrowser,
    cleanSearch: string,
  ): Promise<VehicleEntity[]> {
    const page: PuppeteerPage = await browser.newPage();
    const searchPath = cleanSearch.replace(/\s+/g, '+');
    const searchWords = searchPath.split('+');
    const neoautoUrl = `${this.NEOAUTO_URL}/venta-de-autos?busqueda=${searchPath}&ord_price=0`;

    await page.goto(neoautoUrl, { referer: `${this.NEOAUTO_URL}/venta-de-autos` });

    const html: string = await page.content();
    const $: CheerioAPI = cheerio.load(html);

    return this.getVehiclesByHtml({ $html: $, searchWords, url: this.NEOAUTO_URL });
  }

  async getVehiclesByHtml(data: SearchVehicleDto): Promise<VehicleEntity[]> {
    const { $html, searchWords, url } = data;
    const vehicleList: Cheerio<CheerioElement> = $html('div.s-results')
      .find('article')
      .slice(1);
    const neoautoVehicles: VehicleEntity[] = [];

    for (const vehicleBlock of vehicleList) {
      const vehicleDescription = $html(vehicleBlock)
        .find(HTML_DESCRIPTION_CONCESSIONARIE + OR + HTML_DESCRIPTION_USED)
        .text()
        .toLowerCase();
      const vehicleURL = $html(vehicleBlock)
        .find(HTML_URL_CONCESSIONARIE + OR + HTML_URL_USED)
        .attr('href');
      const vehicleHtmlImage = $html(vehicleBlock).find(
        HTML_IMAGE_CONCESSIONARIE + OR + HTML_IMAGE_USED,
      );
      const imageUrl = vehicleHtmlImage.attr('data-original');
      const { id } = getVehicleInfoByNeoauto(vehicleURL);
      const vehiclePrice = this.neoautoSyncService.getPriceFromHtmlBlock(
        $html,
        vehicleBlock,
      );

      if (includesAll(vehicleDescription, searchWords)) {
        const originalPrice = formatAmount(vehiclePrice).toUnit();

        neoautoVehicles.push({
          description: vehicleDescription,
          frontImage: imageUrl,
          externalId: id,
          isEstimatedPrice: false,
          url: `${url}/${vehicleURL}`,
          currency: PriceCurrency.USD,
          price: originalPrice,
          originalPrice,
        });
      } else {
        break;
      }
    }

    return neoautoVehicles;
  }
}
