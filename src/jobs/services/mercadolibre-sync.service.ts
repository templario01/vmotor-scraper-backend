import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { EnvConfigService } from '../../config/env-config.service';

@Injectable()
export class MercadolibreSyncService {
  private readonly logger: Logger;
  private readonly MERCADOLIBRE_URL: string;
  constructor(private readonly config: EnvConfigService) {
    this.logger = new Logger(MercadolibreSyncService.name);
    this.MERCADOLIBRE_URL = this.config.mercadolibre().url;
  }

  async syncCars() {
    const totalPages = await this.getPages();
    console.log('syncCars', totalPages);
  }

  async getPages(): Promise<number> {
    const MERCADOLIBRE_URL = `${this.MERCADOLIBRE_URL}/autos/autos-camionetas/_OrderId_PRICE_NoIndex_True`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(MERCADOLIBRE_URL, { timeout: 0 });
    const html = await page.content();
    const $ = cheerio.load(html);

    const pages = $('li.andes-pagination__page-count');
    const totalPages = pages.html().split('>')[1].trim();

    await browser.close();

    return Number(totalPages);
  }
}
