import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export interface MercadolibreSearchResponse {
  id: string;
  vehicleImageUrl: string;
  mileage: number;
  url: string;
  year: number;
  price: number;
  tagPrice: string;
  description: string;
}

export interface AddVehicleByCurrency {
  mercadolibreVehicles: VehicleEntity[];
  mercadolibreSearchResponse: MercadolibreSearchResponse;
  exchangeRate?: number;
}
