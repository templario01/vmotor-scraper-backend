import { Injectable } from '@nestjs/common';
import { FavoriteVehicleRepository } from '../../persistence/repositories/favorite-vehicle.repository';
import { AddFavoriteVehicleDto } from './dtos/add-favorite-vehicle.dto';
import { AddFavoriteVehicleInput } from './inputs/add-favorite-vehicle.input';
import { SyncedVehicleEntity } from '../vehicles/entities/synced-vehicle.entity';
import { Status } from '../../shared/dtos/status.enum';
import { PriceCurrency, VehicleCondition } from '../vehicles/dtos/vehicle.enums';
import { DeleteFavoriteVehicleInput } from './inputs/delete-favorite-vehicle.input';

@Injectable()
export class FavoriteVehicleService {
  constructor(private readonly favoriteVehicleRepository: FavoriteVehicleRepository) {}

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
    const { status, condition, mileage, price, currency, ...result } =
      await this.favoriteVehicleRepository.addFavoriteVehicleToUser(request);

    return {
      ...result,
      status: Status[status],
      condition: VehicleCondition[condition],
      currency: PriceCurrency[currency],
      mileage: Number(mileage) || null,
      price: Number(price),
    };
  }

  async deleteFavoriteVehicleToUser(
    input: DeleteFavoriteVehicleInput,
    userId: number,
  ): Promise<SyncedVehicleEntity[]> {
    const vehicles = await this.favoriteVehicleRepository.deleteFavoriteVehicleToUser({
      vehicleUUID: input.vehicle.uuid,
      userId,
    });

    return vehicles.map(({ status, condition, mileage, price, currency, ...result }) => ({
      ...result,
      status: Status[status],
      condition: VehicleCondition[condition],
      currency: PriceCurrency[currency],
      mileage: Number(mileage) || null,
      price: Number(price),
    }));
  }
}
