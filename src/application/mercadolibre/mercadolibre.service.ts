import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { USER_AGENT } from '../../shared/dtos/puppeteer.contant';
import { includesAll } from '../../shared/utils/vehicle.utils';
import { SearchVehicleDto } from '../../shared/dtos/vehicle.dto';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { convertToNumber, parsePrice } from '../../shared/utils/mercado-libre.utils';
import { PriceCurrency } from '../vehicles/dtos/vehicle.enums';

const PRICE_LIMIT_PEN = 4500;
const PRICE_LIMIT_USD = 1500;

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

    return this.getVehiclesByHtml({ $html: $, searchWords });
  }

  async getVehiclesByHtml(data: SearchVehicleDto): Promise<VehicleEntity[]> {
    const { $html, searchWords } = data;
    const vehicleList: Cheerio<CheerioElement> = $html('li.ui-search-layout__item');
    const mercadolibreVehicles: VehicleEntity[] = [];

    for (const vehicleBlock of vehicleList) {
      const vehicleUrlBlock = $html(vehicleBlock).find('div.ui-search-item__group a');
      const priceHtml = $html(vehicleBlock).find(
        'div.ui-search-price div.ui-search-price__second-line span.price-tag span.price-tag-amount span.price-tag-fraction',
      );
      const tagPriceHtml = $html(vehicleBlock).find(
        'div.ui-search-price div.ui-search-price__second-line span.price-tag span.price-tag-amount span.price-tag-symbol',
      );
      const tagPrice = tagPriceHtml.html().trim();
      const price = parsePrice(priceHtml.html());

      const vehicleUrl = vehicleUrlBlock.attr('href');
      const [, firstPath] = vehicleUrl.trim().split('MPE-');
      const [id] = firstPath.split('-');
      const description = vehicleUrlBlock.attr('title')?.toLowerCase();
      const vehicleImage = $html(vehicleBlock).find(
        'div.slick-track div.slick-slide img',
      );
      const vehicleImageUrl = vehicleImage.attr('src');
      const year = $html(vehicleBlock).find(
        'div.ui-search-item__group ul.ui-search-card-attributes li.ui-search-card-attributes__attribute',
      );
      const mileage = $html(vehicleBlock)
        .find(
          'div.ui-search-item__group ul.ui-search-card-attributes li.ui-search-card-attributes__attribute',
        )
        .next();

      const completeDescription = `${description ?? ''} ${year?.html()?.trim() ?? ''}`;

      if (!includesAll(completeDescription, searchWords)) {
        break;
      }

      if (tagPrice === 'S/' && price >= PRICE_LIMIT_PEN) {
        mercadolibreVehicles.push({
          currency: PriceCurrency.PEN,
          externalId: id,
          frontImage: vehicleImageUrl,
          mileage: convertToNumber(mileage.html()),
          isEstimatedPrice: true,
          url: vehicleUrl,
          year: +year.html(),
          originalPrice: price,
          price,
          description,
        });
      } else if (tagPrice === 'U$S' && price >= PRICE_LIMIT_USD) {
        mercadolibreVehicles.push({
          currency: PriceCurrency.USD,
          externalId: id,
          frontImage: vehicleImageUrl,
          mileage: convertToNumber(mileage.html()),
          isEstimatedPrice: false,
          url: vehicleUrl,
          year: +year.html(),
          originalPrice: price,
          price,
          description,
        });
      }
    }

    return mercadolibreVehicles;
  }
}
