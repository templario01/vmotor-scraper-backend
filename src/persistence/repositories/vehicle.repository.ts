import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Vehicle } from '@prisma/client';
import { CreateVehicleDto } from '../../application/vehicles/dtos/create-vehicle.dto';
import { VehicleStatusEnum } from '../../application/vehicles/dtos/vehicle.enums';
import { UpdateInventoryStatus } from '../../application/vehicles/dtos/vehicle.dto';

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
