import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface SyncNeoautoPageParams {
  readonly browser: puppeteer.Browser;
  readonly cheerioInstance$: cheerio.CheerioAPI;
  readonly mainHtml: cheerio.Element;
  readonly websiteId?: number;
}
