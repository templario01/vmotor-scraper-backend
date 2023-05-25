import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export interface MercadolibreSearchResponse {
  readonly id: string;
  readonly vehicleImageUrl: string;
  readonly mileage: number;
  readonly url: string;
  readonly year: number;
  readonly price: number;
  readonly tagPrice: string;
  readonly description: string;
}

export interface AddVehicleByCurrency {
  readonly mercadolibreVehicles: VehicleEntity[];
  readonly mercadolibreSearchResponse: MercadolibreSearchResponse;
  readonly exchangeRate?: number;
}
