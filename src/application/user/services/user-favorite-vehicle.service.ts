import { Injectable } from '@nestjs/common';
import { FavoriteVehicleRepository } from '../../../persistence/repositories/favorite-vehicle.repository';
import { AddFavoriteVehicleDto } from '../dtos/add-favorite-vehicle.dto';
import { AddFavoriteVehicleInput } from '../inputs/add-favorite-vehicle.input';
import {
  PaginatedVehicleEntity,
  SyncedVehicleEntity,
} from '../../vehicles/entities/synced-vehicle.entity';
import { Status } from '../../../shared/dtos/status.enum';
import { PriceCurrency, VehicleCondition } from '../../vehicles/enums/vehicle.enums';
import { DeleteFavoriteVehicleInput } from '../inputs/delete-favorite-vehicle.input';
import { Prisma, Vehicle } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { VehicleRepository } from '../../../persistence/repositories/vehicle.repository';
import { GetFavoriteVehiclesArgs } from '../inputs/get-searches.input';

@Injectable()
export class UserFavoriteVehicleService {
  constructor(
    private readonly favoriteVehicleRepository: FavoriteVehicleRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async getAllFavoriteVehicles(
    userId: number,
    params: GetFavoriteVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    const where: Prisma.VehicleWhereInput = {
      users: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    };

    return this.vehicleRepository.findVehicles({ ...params, where });
  }

  async addFavoriteVehicleToUser(
    { vehicle }: AddFavoriteVehicleInput,
    userId: number,
  ): Promise<SyncedVehicleEntity[]> {
    const request: AddFavoriteVehicleDto = {
      vehicleUUID: vehicle.uuid,
      userId,
    };
    const vehicles = await this.favoriteVehicleRepository.addFavoriteVehicleToUser(
      request,
    );

    return vehicles.map((vehicle) => this.mapToEntity(vehicle));
  }

  async deleteFavoriteVehicleToUser(
    input: DeleteFavoriteVehicleInput,
    userId: number,
  ): Promise<SyncedVehicleEntity[]> {
    const vehicles = await this.favoriteVehicleRepository.deleteFavoriteVehicleToUser({
      vehicleUUID: input.vehicle.uuid,
      userId,
    });

    return vehicles.map((vehicle) => this.mapToEntity(vehicle));
  }

  private mapToEntity(vehicle: Vehicle): SyncedVehicleEntity {
    const { status, condition, mileage, price, currency, originalPrice, ...result } =
      vehicle;
    return plainToInstance(SyncedVehicleEntity, <SyncedVehicleEntity>{
      ...result,
      status: Status[status],
      condition: VehicleCondition[condition],
      currency: PriceCurrency[currency],
      mileage: Number(mileage) || null,
      originalPrice: Number(originalPrice) || null,
      price: Number(price),
    });
  }
}
