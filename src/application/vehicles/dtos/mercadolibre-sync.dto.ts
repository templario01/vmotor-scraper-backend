import { CheerioAPI, Element as CheerioElement } from 'cheerio';
import { PriceCurrency } from './vehicle.enums';

export interface SyncMercadolibreVehicle {
  readonly parentHtml: CheerioAPI;
  readonly vehicleBlock: CheerioElement;
  readonly price: number;
  readonly websiteId: number;
  readonly currency: PriceCurrency;
}
