import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { AddFavoriteVehicleDto } from '../../application/favorite-vehicle/dtos/add-favorite-vehicle.dto';
import { DeleteFavoriteVehicleDto } from '../../application/favorite-vehicle/dtos/delete-favorite-vehicle.dto';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaErrorCodes } from '../../shared/dtos/prisma.dto';

@Injectable()
export class FavoriteVehicleRepository {
  private readonly logger = new Logger(FavoriteVehicleRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async addFavoriteVehicleToUser(data: AddFavoriteVehicleDto): Promise<Vehicle> {
    try {
      const { vehicleInfo, userId, websiteUUID } = data;

      const vehicle = await this.prisma.vehicle.upsert({
        where: { externalId: vehicleInfo.externalId },
        update: { ...vehicleInfo },
        create: {
          ...vehicleInfo,
          website: {
            connect: {
              uuid: websiteUUID,
            },
          },
        },
      });

      await this.prisma.userFavoriteVehicle.upsert({
        where: {
          userId_vehicleId: { userId, vehicleId: vehicle.id },
        },
        create: {
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
        update: {
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

      return vehicle;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = error.meta['cause'];
        this.logger.error(message);

        switch (true) {
          case error.message.includes("'Website'"):
            throw new NotFoundException('Invalid Website');

          case error.message.includes("'User'"):
            throw new NotFoundException('Invalid User');
          default:
            throw new UnprocessableEntityException(error);
        }
      } else {
        this.logger.error(error);
        throw new UnprocessableEntityException(error);
      }
    }
  }

  async deleteFavoriteVehicleToUser(data: DeleteFavoriteVehicleDto): Promise<Vehicle[]> {
    try {
      const { userId, vehicleUUID } = data;

      const currentVehicle = await this.prisma.vehicle.findUnique({
        where: { uuid: vehicleUUID },
      });

      await this.prisma.userFavoriteVehicle.delete({
        where: {
          userId_vehicleId: { userId, vehicleId: currentVehicle.id },
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const message = error.meta['cause'];
        this.logger.error(message);

        if (error.code === PrismaErrorCodes.P2025) {
          throw new NotFoundException('Vehicle already deleted from favorites');
        }
        throw new UnprocessableEntityException(error);
      } else {
        this.logger.error(error);
        throw new UnprocessableEntityException(error);
      }
    }
  }
}
