import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { IPaginatedVehicleEntity } from './entities/synced-vehicle.entity';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';
import { Prisma } from '@prisma/client';
import {
  UserVehicleSearchDto,
  VehicleSearchWithNameDto,
} from '../user/dtos/user-vehicle-search.dto';
import { VehicleSearchRepository } from '../../persistence/repositories/vehicle-search.repository';
import { BuildPrismaFiltersDto } from './dtos/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleSearchRepository: VehicleSearchRepository,
  ) {}

  async getVehiclesByAdvancedSearch(
    params: GetVehiclesArgs,
    userId?: number,
  ): Promise<IPaginatedVehicleEntity> {
    const { searchName, city, ...inputProps } = params;
    const { keywords, year } = getWordsAndYear(searchName);

    const where = this.buildPrismaFilters({ keywords, city, year });
    await this.saveVehicleSearch({ keywords, searchName, year, location: city }, userId);

    return this.vehicleRepository.findVehicles({
      where,
      ...inputProps,
    });
  }

  private buildPrismaFilters(params: BuildPrismaFiltersDto): Prisma.VehicleWhereInput {
    const { keywords, year, city } = params;
    const yearFilter: Prisma.VehicleWhereInput = year ? { year: { equals: year } } : {};
    const locationFilter: Prisma.VehicleWhereInput = city
      ? {
          location: {
            contains: city,
            mode: 'insensitive',
          },
        }
      : {};
    const matchWords: Prisma.Enumerable<Prisma.VehicleWhereInput> = keywords.map(
      (keyWord) => ({
        description: { mode: 'insensitive', contains: keyWord },
      }),
    );

    return {
      AND: [...matchWords, yearFilter, locationFilter],
    };
  }

  private async saveVehicleSearch(
    params: VehicleSearchWithNameDto,
    userId?: number,
  ): Promise<void> {
    const { searchName, location, keywords, year } = params;
    if (!userId) return;

    const newSearch: UserVehicleSearchDto = {
      text: searchName,
      search: {
        location,
        keywords,
        year,
      },
    };

    await this.vehicleSearchRepository.create(userId, newSearch);
  }
}
