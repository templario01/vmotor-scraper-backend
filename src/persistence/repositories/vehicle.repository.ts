import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Vehicle } from '@prisma/client';
import { CreateVehicleDto } from '../../application/vehicles/dtos/requests/create-vehicle.dto';
import {
  VehicleCondition,
  VehicleStatusEnum,
} from '../../application/vehicles/dtos/enums/vehicle.enums';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(brand: string, model: string) {
    return this.prisma.vehicle.findFirst({
      where: {
        AND: [
          {
            description: {
              contains: brand,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: model,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }

  async upsert({
    vehicle,
    brandId,
    modelId,
    websiteId,
  }: CreateVehicleDto): Promise<Vehicle> {
    try {
      return this.prisma.vehicle.upsert({
        where: {
          externalId: vehicle?.externalId,
        },
        create: {
          ...vehicle,
          brandId,
          websiteId,
          status: 'ACTIVE',
          condition: vehicle.condition,
        },
        update: {
          ...vehicle,
          modelId,
          websiteId,
          status: 'ACTIVE',
          condition: vehicle.condition,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async updateStatusForAllInventory(
    syncedVehiclesIds: string[],
    vehicleCondition: VehicleCondition,
  ) {
    console.log(vehicleCondition);
    return this.prisma.vehicle.updateMany({
      where: {
        AND: [
          {
            externalId: {
              notIn: syncedVehiclesIds,
            },
          },
          {
            condition: vehicleCondition,
          },
        ],
      },
      data: {
        status: VehicleStatusEnum.INACTIVE,
      },
    });
  }
}
