import { VehicleCondition } from '../enums/vehicle.enums';

export interface VehicleSearchDto {
  readonly keywords: string[];
  readonly year?: number;
  readonly location?: string;
  readonly condition?: VehicleCondition;
}

export interface UserVehicleSearchDto {
  readonly search: VehicleSearchDto;
  readonly text: string;
}

export interface UserFiltersDto {
  readonly locations: string[];
  readonly keywords: string[];
  readonly completeSearches: VehicleSearchDto[];
}

export type VehicleSearchWithNameDto = VehicleSearchDto & { readonly searchName: string };
