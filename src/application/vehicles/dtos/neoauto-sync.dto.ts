import { Browser } from 'puppeteer';
import { Element, CheerioAPI } from 'cheerio';

export interface SyncNeoautoPageParams {
  readonly browser: Browser;
  readonly cheerioInstance$: CheerioAPI;
  readonly mainHtml: Element;
  readonly websiteId?: number;
}

export interface SyncNeoautoVehicle {
  imageUrl?: string;
  vehicleURL?: string;
  vehiclePrice?: number;
  websiteId?: number;
  vehicleDescription?: string;
}

export type VehicleBrandAndModel = {
  brand: string;
  modelWithYear: string;
  id: string;
};
