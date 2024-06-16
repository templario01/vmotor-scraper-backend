import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import {
  IPaginatedVehicleEntity,
  SyncedVehicleEntity,
} from './entities/synced-vehicle.entity';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';
import { Prisma } from '@prisma/client';
import {
  UserFiltersDto,
  UserVehicleSearchDto,
  VehicleSearchDto,
  VehicleSearchWithNameDto,
} from './dtos/user-vehicle-search.dto';
import { SearchRepository } from '../../persistence/repositories/search.repository';
import { BuildPrismaFiltersDto, Search } from './dtos/vehicle.dto';
import { GetRecommendedVehiclesArgs } from './inputs/get-recommended-vehicles.input';
import { Condition } from './enums/vehicle.enums';
import { RedisClient } from '../../settings/redis/redis.client';
import { plainToInstance } from 'class-transformer';
import { Status } from '../../shared/dtos/status.enum';
import { PriceCurrency } from '../../shared/enums/currency.enum';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly searchRepository: SearchRepository,
    private readonly redisClient: RedisClient,
  ) {}

  async getVehiclesByAdvancedSearch(
    params: GetVehiclesArgs,
    userId?: number,
  ): Promise<IPaginatedVehicleEntity> {
    const { searchName, city, condition, ...inputProps } = params;
    const { keywords, year } = getWordsAndYear(searchName);

    const where = this.buildPrismaFiltersForSearch({ keywords, city, year, condition });
    if (keywords.length > 0) {
      await this.saveVehicleSearch(
        {
          keywords,
          searchName,
          year,
          location: city,
          condition: Condition[condition],
        },
        userId,
      );
    }

    return this.vehicleRepository.findVehicles({
      where,
      ...inputProps,
    });
  }

  async getRecommendedVehicles(
    input: GetRecommendedVehiclesArgs,
    userId: number,
  ): Promise<IPaginatedVehicleEntity> {
    const result = await this.searchRepository.findLastSearchesByUser(userId);
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

    const where = this.buildPrismaFiltersForRecommendation({
      locations,
      keywords,
      completeSearches,
    });

    return this.vehicleRepository.findVehicles({
      hasOrderBy: false,
      where,
      ...input,
    });
  }

  private buildPrismaFiltersForSearch(
    params: BuildPrismaFiltersDto,
  ): Prisma.VehicleWhereInput {
    const { keywords, year, city, condition } = params;
    const vehicleCondition = condition === 'ALL' ? undefined : condition;
    const location = city === 'Todas' ? undefined : city;
    const yearFilter: Prisma.VehicleWhereInput = year ? { year: { equals: year } } : {};
    const conditionFilter: Prisma.VehicleWhereInput = vehicleCondition
      ? { condition: { equals: Condition[vehicleCondition] } }
      : {};
    const locationFilter: Prisma.VehicleWhereInput = location
      ? {
          location: {
            contains: city,
            mode: 'insensitive',
          },
        }
      : {};
    const matchKeywords: Prisma.Enumerable<Prisma.VehicleWhereInput> = keywords.map(
      (keyWord) => ({
        description: { mode: 'insensitive', contains: keyWord },
      }),
    );

    return {
      AND: [...matchKeywords, yearFilter, locationFilter, conditionFilter],
    };
  }

  private buildPrismaFiltersForRecommendation(
    data: UserFiltersDto,
  ): Prisma.VehicleWhereInput {
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
    const specificSearches = completeSearches.map(({ keywords, year, condition }) => ({
      AND: [
        ...keywords.map<Prisma.VehicleWhereInput>((keyword) => ({
          description: { mode: 'insensitive', contains: keyword },
        })),
        { year },
        { condition: Condition[condition] },
      ],
    }));

    return {
      OR: [
        {
          OR: [...matchKeywords, ...matchLocations],
        },
        ...specificSearches,
      ],
    };
  }

  public async findRecommendedVehicles(): Promise<SyncedVehicleEntity[]> {
    const searches = await this.getAllSearches();
    const vehicles = await this.vehicleRepository.getRecommendedVehicles(searches);
    const uniqueVehicles = vehicles.reduce((acc, vehicle) => {
      if (!acc.some((existingVehicle) => existingVehicle.id === vehicle.id)) {
        acc.push(vehicle);
      }
      return acc;
    }, []);

    return uniqueVehicles.map(
      ({ condition, currency, mileage, price, status, originalPrice, ...vehicle }) =>
        plainToInstance(SyncedVehicleEntity, <SyncedVehicleEntity>{
          ...vehicle,
          status: Status[status],
          condition: Condition[condition],
          currency: PriceCurrency[currency],
          mileage: mileage?.toNumber(),
          price: price?.toNumber(),
          originalPrice: originalPrice?.toNumber(),
        }),
    );
  }

  private async getAllSearches(): Promise<Search[]> {
    const key = Buffer.from('getVehiclesByAdvancedSearch').toString('base64');
    const data = await this.redisClient.adapter.get(key);
    return JSON.parse(data).data;
  }

  private async saveVehicleSearch(
    params: VehicleSearchWithNameDto,
    userId?: number,
  ): Promise<void> {
    const { searchName, location, keywords, year, condition } = params;
    if (!userId) return;

    const newSearch: UserVehicleSearchDto = {
      text: searchName,
      search: {
        location,
        keywords,
        year,
        condition,
      },
    };

    await this.searchRepository.create(userId, newSearch);
  }
}
