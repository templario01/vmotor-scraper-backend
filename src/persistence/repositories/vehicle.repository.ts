import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Vehicle } from '@prisma/client';
import {
  Condition,
  PriceCurrency,
  VehicleStatusEnum,
} from '../../application/vehicles/enums/vehicle.enums';
import {
  Search,
  UpdateInventoryStatus,
} from '../../application/vehicles/dtos/vehicle.dto';
import {
  IPaginatedVehicleEntity,
  SyncedVehicleEntity,
} from '../../application/vehicles/entities/synced-vehicle.entity';
import { Status } from '../../shared/dtos/status.enum';
import { IEdgeType } from '../../shared/utils/pagination/cursor-pagination';
import { GetVehiclesWhereInputDto } from '../../application/vehicles/dtos/get-vehicles.dto';
import { CreateVehicleDto } from '../../shared/dtos/vehicle.dto';
import { getWordsAndYear } from '../../shared/utils/vehicle.utils';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findVehicles(params: GetVehiclesWhereInputDto): Promise<IPaginatedVehicleEntity> {
    const { take, after, where, hasOrderBy = true } = params;
    const totalCount = await this.prisma.vehicle.count({ where });
    const vehicles = await this.prisma.vehicle.findMany({
      where,
      take: typeof take === 'number' ? take + 1 : undefined,
      skip: after ? 1 : undefined,
      cursor: after ? { uuid: after } : undefined,
      orderBy: hasOrderBy ? [{ price: 'asc' }] : [],
    });

    const results = vehicles.map(
      ({ status, condition, mileage, price, currency, originalPrice, ...result }) => ({
        ...result,
        status: Status[status],
        condition: Condition[condition],
        currency: PriceCurrency[currency],
        mileage: mileage?.toNumber(),
        price: price?.toNumber(),
        originalPrice: originalPrice?.toNumber(),
      }),
    );

    const hasNextPage = typeof take === 'number' ? results.length > take : false;
    if (hasNextPage) results.pop();

    const lastItem = results[results?.length - 1];
    const endCursor = lastItem?.uuid;
    const edges = results.map<IEdgeType<SyncedVehicleEntity>>((vehicle) => ({
      cursor: vehicle.uuid,
      node: vehicle,
    }));

    return {
      edges,
      nodes: results,
      hasNextPage,
      endCursor,
      totalCount,
    };
  }

  async upsert({ vehicle, websiteId }: CreateVehicleDto): Promise<Vehicle> {
    try {
      const upsert = await this.prisma.vehicle.upsert({
        where: {
          externalId: vehicle?.externalId,
        },
        create: {
          ...vehicle,
          websiteId,
          currency: PriceCurrency[vehicle.currency],
          status: VehicleStatusEnum.ACTIVE,
        },
        update: {
          ...vehicle,
          websiteId,
          currency: PriceCurrency[vehicle.currency],
          status: VehicleStatusEnum.ACTIVE,
        },
      });
      return upsert;
    } catch (error) {
      return null;
    }
  }

  async updateStatusForAllInventory(data: UpdateInventoryStatus) {
    const { syncedVehiclesIds, websiteId, vehicleCondition } = data;
    const result = await this.prisma.vehicle.updateMany({
      where: {
        website: {
          id: websiteId,
        },
        externalId: {
          notIn: syncedVehiclesIds,
        },
        status: VehicleStatusEnum.ACTIVE,
        ...(vehicleCondition && { condition: vehicleCondition }),
      },
      data: {
        status: VehicleStatusEnum.INACTIVE,
      },
    });

    return result;
  }

  public async getRecommendedVehicles(data: Search[]): Promise<Vehicle[]> {
    const vehicles = await Promise.all(
      data.map(async (search) => {
        const { keywords } = getWordsAndYear(search.searchName);
        const matchKeywords: Prisma.Enumerable<Prisma.VehicleWhereInput> = keywords.map(
          (keyWord) => ({
            description: { mode: 'insensitive', contains: keyWord },
          }),
        );
        const vehicle = await this.prisma.vehicle.findFirst({
          where: {
            AND: [...matchKeywords, { status: VehicleStatusEnum.ACTIVE }],
          },
          orderBy: { price: 'asc' },
        });
        return vehicle;
      }),
    );
    return vehicles;
  }
}
