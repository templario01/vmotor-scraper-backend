import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { BrandsRepository } from '../../persistence/repositories/brands.repository';

const NEOAUTO_URL = 'https://neoauto.com/';

@Injectable()
export class BrandsSyncService {
  private readonly logger: Logger;
  constructor(private readonly brandsRepository: BrandsRepository) {
    this.logger = new Logger(BrandsSyncService.name);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async syncBrands() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(NEOAUTO_URL, { timeout: 0 });
    let html = await page.content();
    let $ = cheerio.load(html);

    const brands = await this.getOptionsFromHtml($, '.select_brand option');
    for (let i = 0; i < brands.length; i++) {
      const brandName = brands[i];
      await page.select('.select_brand', brandName);
      await page.waitForFunction(
        'document.querySelectorAll(".select_model option").length > 1',
      );

      html = await page.content();
      $ = cheerio.load(html);
      const models = await this.getOptionsFromHtml($, '.select_model option');
      const result = await this.brandsRepository.upsert(brandName, models);

      this.logger.verbose(`Brand ${result.name} synced`);
    }

    await browser.close();
  }

  async getOptionsFromHtml(
    html$: cheerio.CheerioAPI,
    className: string,
  ): Promise<string[]> {
    return html$(className)
      .map((_, option) => html$(option).val())
      .get()
      .map((option) => option.replace(/ /g, '-').toLowerCase())
      .filter((option) => option !== '');
  }
}
