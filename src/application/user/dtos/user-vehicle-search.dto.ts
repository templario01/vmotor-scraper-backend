export interface VehicleSearchDto {
  readonly keywords: string[];
  readonly year?: number;
  readonly location?: string;
}

export interface UserVehicleSearchDto {
  readonly search: VehicleSearchDto;
  readonly text: string;
}

export type VehicleSearchWithNameDto = VehicleSearchDto & { readonly searchName: string };
