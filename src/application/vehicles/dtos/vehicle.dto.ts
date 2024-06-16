import { Condition, GetVehicleCondition } from '../enums/vehicle.enums';
import { CheerioAPI } from 'cheerio';

export interface SearchVehicleDto {
  readonly $html: CheerioAPI;
  readonly searchWords: string[];
  readonly url?: string;
}

export interface UpdateInventoryStatus {
  readonly syncedVehiclesIds: string[];
  readonly websiteId: number;
  readonly vehicleCondition?: Condition;
}

export interface BuildPrismaFiltersDto {
  readonly keywords: string[];
  readonly year?: number;
  readonly city?: string;
  readonly condition?: GetVehicleCondition;
}

export class Search {
  readonly searchName: string;
}
