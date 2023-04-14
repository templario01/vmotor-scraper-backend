import { VehicleCondition } from './vehicle.enums';
import { CheerioAPI } from 'cheerio';

export interface SearchVehicleDto {
  readonly $html: CheerioAPI;
  readonly searchWords: string[];
  readonly url?: string;
}

export interface UpdateInventoryStatus {
  readonly syncedVehiclesIds: string[];
  readonly websiteId: number;
  readonly vehicleCondition?: VehicleCondition;
}
