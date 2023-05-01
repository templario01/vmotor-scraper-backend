import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { IPaginatedVehicleEntity } from './entities/synced-vehicle.entity';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async getVehiclesByAdvancedSearch(
    params: GetVehiclesArgs,
  ): Promise<IPaginatedVehicleEntity> {
    const { searchName, ...inputProps } = params;
    const { words, year } = getWordsAndYear(searchName);

    return this.vehicleRepository.findVehicles({
      words,
      year,
      ...inputProps,
    });
  }
}
