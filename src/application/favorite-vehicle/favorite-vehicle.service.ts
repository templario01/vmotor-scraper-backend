import { Injectable } from '@nestjs/common';
import { FavoriteVehicleRepository } from '../../persistence/repositories/favorite-vehicle.repository';
import { AddFavoriteVehicleDto } from './dtos/add-favorite-vehicle.dto';
import { AddFavoriteVehicleInput } from './inputs/add-favorite-vehicle.input';
import { SyncedVehicleEntity } from '../vehicles/entities/synced-vehicle.entity';
import { Status } from '../../shared/dtos/status.enum';
import { PriceCurrency, VehicleCondition } from '../vehicles/dtos/vehicle.enums';
import { DeleteFavoriteVehicleInput } from './inputs/delete-favorite-vehicle.input';
import { Vehicle } from '@prisma/client';

@Injectable()
export class FavoriteVehicleService {
  constructor(private readonly favoriteVehicleRepository: FavoriteVehicleRepository) {}

  async getAllFavoriteVehicles(userId: number): Promise<SyncedVehicleEntity[]> {
    const vehicles = await this.favoriteVehicleRepository.findVehiclesByUser(userId);

    return vehicles.map((vehicle) => this.mapToEntity(vehicle));
  }

  async addFavoriteVehicleToUser(
    input: AddFavoriteVehicleInput,
    userId: number,
  ): Promise<SyncedVehicleEntity> {
    const { website: websiteInput, ...data } = input;
    const request: AddFavoriteVehicleDto = {
      vehicleInfo: data,
      websiteUUID: websiteInput.uuid,
      userId,
    };
    const vehicle = await this.favoriteVehicleRepository.addFavoriteVehicleToUser(
      request,
    );

    return this.mapToEntity(vehicle);
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
    const { status, condition, mileage, price, currency, ...result } = vehicle;
    return {
      ...result,
      status: Status[status],
      condition: VehicleCondition[condition],
      currency: PriceCurrency[currency],
      mileage: Number(mileage) || null,
      price: Number(price),
    };
  }
}
