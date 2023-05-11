import { FavoriteVehicleRepository } from '../../persistence/repositories/favorite-vehicle.repository';
import { SearchRepository } from '../../persistence/repositories/search.repository';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';

export const buildUserRepositoryMock = () => {
  const userRepository = jest.mocked<UserRepository>(UserRepository as any, true);
  userRepository.createAccount = jest.fn();
  userRepository.createValidationCode = jest.fn();
  userRepository.findUserByEmail = jest.fn();
  userRepository.findUserByEmailCode = jest.fn();
  userRepository.findUserById = jest.fn();
  userRepository.findUserByToken = jest.fn();
  userRepository.registerSession = jest.fn();
  userRepository.validateAccount = jest.fn();

  return userRepository;
};

export const buildVehicleRepositoryMock = () => {
  const vehicleRepository = jest.mocked<VehicleRepository>(
    VehicleRepository as any,
    true,
  );
  vehicleRepository.findVehicles = jest.fn();
  vehicleRepository.updateStatusForAllInventory = jest.fn();
  vehicleRepository.upsert = jest.fn();

  return vehicleRepository;
};

export const buildFavoriteVehicleRepository = () => {
  const favoriteVehicle = jest.mocked<FavoriteVehicleRepository>(
    FavoriteVehicleRepository as any,
    true,
  );
  favoriteVehicle.addFavoriteVehicleToUser = jest.fn();
  favoriteVehicle.deleteFavoriteVehicleToUser = jest.fn();
  favoriteVehicle.findVehiclesByUser = jest.fn();

  return favoriteVehicle;
};

export const buildSearchRepository = () => {
  const searchRepository = jest.mocked<SearchRepository>(SearchRepository as any, true);
  searchRepository.create = jest.fn();
  searchRepository.delete = jest.fn();
  searchRepository.findByUser = jest.fn();
  searchRepository.findLastSearchesByUser = jest.fn();

  return searchRepository;
};
