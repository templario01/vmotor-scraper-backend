import { CheerioAPI } from 'cheerio';

export interface SearchNeoautoVehicleDto {
  readonly $html: CheerioAPI;
  readonly searchWords: string[];
  readonly url: string;
}
