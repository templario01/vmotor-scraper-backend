import { CheerioAPI } from 'cheerio';

export interface SearchVehicleDto {
  readonly $html: CheerioAPI;
  readonly searchWords: string[];
  readonly url?: string;
}
