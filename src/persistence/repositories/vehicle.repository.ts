import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Vehicle } from '@prisma/client';
import { CreateVehicleDto } from '../../application/vehicles/dtos/requests/create-vehicle.dto';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert({
    vehicle,
    brandId,
    modelId,
    websiteId,
  }: CreateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.upsert({
      where: {
        externalId: vehicle?.externalId,
      },
      create: {
        ...vehicle,
        brandId,
        websiteId,
      },
      update: {
        ...vehicle,
        modelId,
        websiteId,
      },
    });
  }
}
