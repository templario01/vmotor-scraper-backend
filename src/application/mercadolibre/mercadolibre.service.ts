import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import * as cheerio from 'cheerio';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { CheerioAPI, Cheerio, Element as CheerioElement } from 'cheerio';
import { includesAll } from '../../shared/utils/vehicle.utils';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { convertToNumber, parsePrice } from '../../shared/utils/mercado-libre.utils';
import { PriceCurrency } from '../vehicles/dtos/vehicle.enums';
import { CurrencyConverterApiService } from '../currency-converter-api-v1/currency-converter.service';
import { AddVehicleByCurrency } from './dtos/mercadolibre.dto';
import {
  ML_HTML_IMG,
  ML_HTML_MILEAGE,
  ML_HTML_PRICE,
  ML_HTML_TAGPRICE,
  ML_HTML_YEAR,
} from './constants/mercadolibre.constant';
import { formatAmount } from '../../shared/utils/format-amount.utils';
import { SearchVehicleDto } from '../vehicles/dtos/vehicle.dto';

const PRICE_LIMIT_PEN = 4500;
const PRICE_LIMIT_USD = 1500;

@Injectable()
export class MercadolibreService {
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly currencyConverterService: CurrencyConverterApiService,
  ) {}

  async searchMercadolibreVehicles(browser: PuppeteerBrowser, cleanSearch: string) {
    const page: PuppeteerPage = await browser.newPage();
    const { url } = this.envConfigService.mercadolibre();
    const searchPath = cleanSearch.replace(/\s+/g, '-');
    const searchWords = searchPath.split('-');
    const mercadolibreUrl = `${url}/vehiculos/${searchPath}_OrderId_PRICE_NoIndex_True`;

    await page.goto(mercadolibreUrl, { referer: `${url}/vehiculos` });

    const html: string = await page.content();
    const $: CheerioAPI = cheerio.load(html);

    return this.getVehiclesByHtml({ $html: $, searchWords });
  }

  async getVehiclesByHtml(data: SearchVehicleDto): Promise<VehicleEntity[]> {
    const { $html, searchWords } = data;
    const vehicleList: Cheerio<CheerioElement> = $html('li.ui-search-layout__item');
    const mercadolibreVehicles: VehicleEntity[] = [];
    const exchangeRate = await this.currencyConverterService.convertCurrency({
      from: PriceCurrency.PEN,
      to: PriceCurrency.USD,
    });

    for (const vehicleBlock of vehicleList) {
      const vehicleUrlBlock = $html(vehicleBlock).find('div.ui-search-item__group a');
      const priceHtml = $html(vehicleBlock).find(ML_HTML_PRICE);
      const tagPriceHtml = $html(vehicleBlock).find(ML_HTML_TAGPRICE);
      const tagPrice = tagPriceHtml.html()?.trim() || '';
      const url = vehicleUrlBlock.attr('href');
      const [, firstPath] = url?.trim()?.split('MPE-') || [undefined, undefined];
      const [id] = firstPath?.split('-') || undefined;
      const description = vehicleUrlBlock.attr('title')?.toLowerCase();
      const vehicleImage = $html(vehicleBlock).find(ML_HTML_IMG);
      const vehicleImageUrl = vehicleImage.attr('src');
      const year = $html(vehicleBlock).find(ML_HTML_YEAR);
      const mileage = $html(vehicleBlock).find(ML_HTML_MILEAGE).next();
      const completeDescription = `${description ?? ''} ${year?.html()?.trim() ?? ''}`;

      if (!includesAll(completeDescription, searchWords)) {
        break;
      }

      const vehicle = {
        mileage: convertToNumber(mileage?.html()?.trim()) || null,
        year: +year?.html()?.trim(),
        price: parsePrice(priceHtml?.html()) || null,
        tagPrice,
        description,
        id,
        vehicleImageUrl,
        url,
      };

      if (vehicle?.id && vehicle?.price) {
        this.addVehicleByCurrency({
          exchangeRate: exchangeRate?.new_amount,
          mercadolibreSearchResponse: vehicle,
          mercadolibreVehicles,
        });
      }
    }

    return mercadolibreVehicles;
  }

  private addVehicleByCurrency(data: AddVehicleByCurrency): VehicleEntity[] {
    const {
      mercadolibreSearchResponse: { tagPrice, id, vehicleImageUrl, price, ...props },
      mercadolibreVehicles,
      exchangeRate,
    } = data;

    if (tagPrice === 'S/' && price >= PRICE_LIMIT_PEN) {
      const estimatedPrice = exchangeRate ? formatAmount(price * exchangeRate) : null;

      mercadolibreVehicles.push({
        currency: PriceCurrency.PEN,
        externalId: id,
        frontImage: vehicleImageUrl,
        isEstimatedPrice: true,
        originalPrice: formatAmount(price).toUnit(),
        price: estimatedPrice.toUnit(),
        ...props,
      });
    } else if (tagPrice === 'U$S' && price >= PRICE_LIMIT_USD) {
      const originalPrice = formatAmount(price).toUnit();

      mercadolibreVehicles.push({
        currency: PriceCurrency.USD,
        externalId: id,
        frontImage: vehicleImageUrl,
        isEstimatedPrice: false,
        price: originalPrice,
        originalPrice,
        ...props,
      });
    }

    return mercadolibreVehicles;
  }
}
