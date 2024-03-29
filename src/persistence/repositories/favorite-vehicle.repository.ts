import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { AddFavoriteVehicleDto } from '../../application/user/dtos/add-favorite-vehicle.dto';
import { Vehicle } from '@prisma/client';
import { DeleteFavoriteVehicleDto } from '../../application/user/dtos/delete-favorite-vehicle.dto';

@Injectable()
export class FavoriteVehicleRepository {
  private readonly logger = new Logger(FavoriteVehicleRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async addFavoriteVehicleToUser(data: AddFavoriteVehicleDto): Promise<Vehicle[]> {
    const { vehicleUUID, userId } = data;
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { uuid: vehicleUUID },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const vehicleFavorite = await this.prisma.userFavoriteVehicle.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId: vehicle.id,
        },
      },
    });

    if (vehicleFavorite) {
      throw new BadGatewayException('vehicle already added in favorites');
    }

    await this.prisma.userFavoriteVehicle.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        vehicle: {
          connect: {
            uuid: vehicle.uuid,
          },
        },
      },
    });

    const result = await this.prisma.vehicle.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
    });

    return result;
  }

  async deleteFavoriteVehicleToUser(data: DeleteFavoriteVehicleDto): Promise<Vehicle[]> {
    const { userId, vehicleUUID } = data;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { uuid: vehicleUUID },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const vehicleFavorite = await this.prisma.userFavoriteVehicle.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId: vehicle.id,
        },
      },
    });

    if (!vehicleFavorite) {
      throw new BadGatewayException('vehicle already deleted from favorites');
    }

    await this.prisma.userFavoriteVehicle.delete({
      where: {
        userId_vehicleId: { userId, vehicleId: vehicle.id },
      },
    });

    const result = await this.prisma.vehicle.findMany({
      where: {
        users: {
          some: {
            user: {
              id: userId,
            },
          },
        },
      },
    });

    return result;
  }
}
