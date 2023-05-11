import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { VehicleSearchRepository } from '../../../persistence/repositories/search.repository';
import { UserSearchEntity } from '../entities/user-search.entity';
import { IPaginatedVehicleEntity } from '../../vehicles/entities/synced-vehicle.entity';
import { UserFiltersDto, VehicleSearchDto } from '../dtos/user-vehicle-search.dto';
import { GetRecommendedVehiclesArgs } from '../inputs/get-recommended-vehicles.input';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { DeleteSearchInput } from '../inputs/delete-search.input';

@Injectable()
export class UserSearchService {
  constructor(
    private readonly vehicleSearchRepository: VehicleSearchRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async getSearchHistory(userId: number): Promise<UserSearchEntity[]> {
    const result = await this.vehicleSearchRepository.findByUser(userId);

    return result.map(({ text, uuid, createdAt }) => ({ text, createdAt, uuid }));
  }

  async deleteSearch(
    input: DeleteSearchInput,
    userId: number,
  ): Promise<UserSearchEntity[]> {
    const { search } = input;
    const result = await this.vehicleSearchRepository.delete(userId, search.uuid);

    return result.map(({ text, uuid, createdAt }) => ({ text, createdAt, uuid }));
  }

  async getRecommendedVehicles(
    input: GetRecommendedVehiclesArgs,
    userId: number,
  ): Promise<IPaginatedVehicleEntity> {
    const result = await this.vehicleSearchRepository.findLastSearchesByUser(userId);
    const searches: VehicleSearchDto[] = result.map(({ search }) =>
      JSON.parse(<string>search),
    );

    const completeSearches = searches.filter(
      ({ keywords, year }) => keywords?.length > 0 && year,
    );
    const locations = [
      ...new Set(
        searches
          .filter(({ year, location }) => !year && location)
          .map(({ location }) => location.toLowerCase()),
      ),
    ];
    const keywords = [
      ...new Set(
        searches.filter(({ year }) => !year).flatMap(({ keywords }) => keywords),
      ),
    ];

    const where = this.buildPrismaFilters({ locations, keywords, completeSearches });

    return this.vehicleRepository.findVehicles({
      hasOrderBy: false,
      where,
      ...input,
    });
  }

  private buildPrismaFilters(data: UserFiltersDto): Prisma.VehicleWhereInput {
    const { keywords, completeSearches, locations } = data;
    const matchKeywords: Prisma.Enumerable<Prisma.VehicleWhereInput> = keywords.map(
      (keyWord) => ({
        description: { mode: 'insensitive', contains: keyWord },
      }),
    );
    const matchLocations: Prisma.Enumerable<Prisma.VehicleWhereInput> = locations.map(
      (location) => ({
        location: { mode: 'insensitive', contains: location },
      }),
    );

    const specificSearches = completeSearches.map(({ keywords, year }) => ({
      AND: [
        ...keywords.map<Prisma.VehicleWhereInput>((keyword) => ({
          description: { mode: 'insensitive', contains: keyword },
        })),
        { year },
      ],
    }));

    return {
      OR: [
        {
          AND: [...matchKeywords, ...matchLocations],
        },
        ...specificSearches,
      ],
    };
  }
}
