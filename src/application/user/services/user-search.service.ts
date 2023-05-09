import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { Prisma } from '@prisma/client';
import { VehicleSearchRepository } from '../../../persistence/repositories/search.repository';
import { BuildPrismaFiltersDto } from '../../vehicles/dtos/vehicle.dto';
import { UserSearchEntity } from '../entities/user-search.entity';

@Injectable()
export class UserSearchService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleSearchRepository: VehicleSearchRepository,
  ) {}

  async getFeaturedVehicles(userId: number): Promise<any> {
    const data = await this.vehicleSearchRepository.findByUser(userId);
    /* const where = this.buildPrismaFilters({ keywords, city, year });

    return this.vehicleRepository.findVehicles({
      where,
      ...inputProps,
    }); */
  }

  async getSearchsHistory(userId: number): Promise<UserSearchEntity> {
    const result = await this.vehicleSearchRepository.findByUser(userId);

    return;
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
}
