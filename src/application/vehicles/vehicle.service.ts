import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { IPaginatedVehicleEntity } from './entities/synced-vehicle.entity';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async getVehiclesByAdvancedSearch(
    params: GetVehiclesArgs,
  ): Promise<IPaginatedVehicleEntity> {
    const { searchName, city, ...inputProps } = params;
    const { keyWords, year } = getWordsAndYear(searchName);

    const yearFilter: Prisma.VehicleWhereInput = year ? { year: { equals: year } } : {};
    const locationFilter: Prisma.VehicleWhereInput = city
      ? {
          location: {
            contains: city,
            mode: 'insensitive',
          },
        }
      : {};
    const matchWords: Prisma.Enumerable<Prisma.VehicleWhereInput> = keyWords.map(
      (keyWord) => ({
        description: { mode: 'insensitive', contains: keyWord },
      }),
    );
    const where: Prisma.VehicleWhereInput = {
      AND: [...matchWords, yearFilter, locationFilter],
    };

    return this.vehicleRepository.findVehicles({
      where,
      ...inputProps,
    });
  }
}
