import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { plainToInstance } from 'class-transformer';
import { VehicleModel } from '../dtos/models/vehicle.model';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async findVehicle(brand: string, model: string): Promise<VehicleModel> {
    const { mileage, usdPrice, penPrice, ...result } =
      await this.vehicleRepository.findFirst(brand, model);

    return plainToInstance(VehicleModel, {
      ...result,
      mileage: mileage?.toNumber() || null,
      usdPrice: usdPrice?.toNumber() || null,
      penPrice: penPrice?.toNumber() || null,
    });
  }
}
