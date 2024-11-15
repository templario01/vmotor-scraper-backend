import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import {
  IPaginatedVehicleEntity,
  SyncedVehicleEntity,
} from './entities/synced-vehicle.entity';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';
import { Prisma, Vehicle } from '@prisma/client';
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
import { isDefined } from 'class-validator';

export const DEFAULT_SEARCHES = [
  { searchName: 'chevrolet sail 2020', condition: 'ALL' },
  { searchName: 'chevrolet onix', condition: 'ALL' },
  { searchName: 'mazda 3', condition: 'ALL' },
  { searchName: 'toyota rav4', condition: 'ALL' },
  { searchName: 'hyundai i10', condition: 'ALL' },
  { searchName: 'hyundai elantra 2020', condition: 'ALL' },
  { searchName: 'hyundai elantra 2018', condition: 'ALL' },
  { searchName: 'hyundai elantra 2021', condition: 'ALL' },
  { searchName: 'toyota yaris', condition: 'ALL' },
];

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);
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
    console.log(where.AND);
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
        name: { mode: 'insensitive', contains: keyWord },
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
    let searches: Search[];
    searches = (await this.getAllSearches()).filter((obj) => Object.keys(obj).length > 0);
    if (searches.length <= 3) {
      searches = [...searches, ...DEFAULT_SEARCHES];
    }

    const vehicles = await this.vehicleRepository.getRecommendedVehicles(searches);

    const uniqueVehicles: Vehicle[] = vehicles.reduce((acc, vehicle) => {
      if (!acc.some((existingVehicle) => existingVehicle?.id === vehicle?.id)) {
        acc.push(vehicle);
      }
      return acc;
    }, []);
    console.log(uniqueVehicles);

    return uniqueVehicles
      .filter((vehicle) => isDefined(vehicle))
      .map(
        ({
          condition,
          currency,
          mileage,
          price,
          status,
          originalPrice,
          description,
          ...vehicle
        }) =>
          plainToInstance(SyncedVehicleEntity, <SyncedVehicleEntity>{
            ...vehicle,
            description,
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
    try {
      const key = Buffer.from('getVehiclesByAdvancedSearch').toString('base64');
      const data = await this.redisClient.adapter.get(key);
      return JSON.parse(data).data;
    } catch (error) {
      this.logger.error('fail to get searches from redis');
      return [];
    }
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
