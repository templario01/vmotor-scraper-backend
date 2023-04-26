import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Vehicle } from '@prisma/client';
import { CreateVehicleDto } from '../../application/vehicles/dtos/create-vehicle.dto';
import {
  PriceCurrency,
  VehicleCondition,
  VehicleStatusEnum,
} from '../../application/vehicles/dtos/vehicle.enums';
import { UpdateInventoryStatus } from '../../application/vehicles/dtos/vehicle.dto';
import {
  IPaginatedVehicleEntity,
  SyncedVehicleEntity,
} from '../../application/vehicles/entities/synced-vehicle.entity';
import { Status } from '../../shared/dtos/status.enum';
import { IEdgeType } from '../../shared/utils/pagination/cursor-pagination';
import { GetVehiclesDto } from '../../application/vehicles/dtos/get-vehicles.dto';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBestVehicles(params: GetVehiclesDto): Promise<IPaginatedVehicleEntity> {
    const { words, year, take, after } = params;

    const validateYear: Prisma.VehicleWhereInput = year ? { year: { equals: year } } : {};
    const validateWords: Prisma.Enumerable<Prisma.VehicleWhereInput> = words.map(
      (word) => {
        return {
          description: { mode: 'insensitive', contains: word },
        };
      },
    );
    const where: Prisma.VehicleWhereInput = {
      AND: [...validateWords, validateYear],
    };

    const totalCount = await this.prisma.vehicle.count({ where });
    console.log(totalCount);

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      take: typeof take === 'number' ? take + 1 : undefined,
      skip: after ? 1 : undefined,
      cursor: after ? { uuid: after } : undefined,
      orderBy: [{ price: 'asc' }],
    });

    const results = vehicles.map(
      ({ status, condition, mileage, price, currency, ...result }) => ({
        ...result,
        status: Status[status],
        condition: VehicleCondition[condition],
        currency: PriceCurrency[currency],
        mileage: mileage?.toNumber(),
        price: price?.toNumber(),
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
      return this.prisma.vehicle.upsert({
        where: {
          externalId: vehicle?.externalId,
        },
        create: {
          ...vehicle,
          websiteId,
          status: 'ACTIVE',
          condition: vehicle.condition,
        },
        update: {
          ...vehicle,
          websiteId,
          status: 'ACTIVE',
          condition: vehicle.condition,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async updateStatusForAllInventory({
    syncedVehiclesIds,
    websiteId,
    vehicleCondition,
  }: UpdateInventoryStatus) {
    return this.prisma.vehicle.updateMany({
      where: {
        AND: [
          {
            website: {
              id: websiteId,
            },
          },
          {
            externalId: {
              notIn: syncedVehiclesIds,
            },
          },
          { ...(vehicleCondition && { condition: vehicleCondition }) },
        ],
      },
      data: {
        status: VehicleStatusEnum.INACTIVE,
      },
    });
  }
}
