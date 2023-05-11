import { Test, TestingModule } from '@nestjs/testing';
import { UserFavoriteVehicleService } from './user-favorite-vehicle.service';
import { buildFavoriteVehicleRepository } from '../../../shared/test-utils/repositories.mock';
import { buildVehiclesMock } from '../../../shared/mocks/prisma-types.mocks';
import { FavoriteVehicleRepository } from '../../../persistence/repositories/favorite-vehicle.repository';
import { SyncedVehicleEntity } from '../../vehicles/entities/synced-vehicle.entity';

describe('FavoriteVehicleService', () => {
  let service: UserFavoriteVehicleService;
  let module: TestingModule;
  const userFavoriteVehicleRepositoryMock = buildFavoriteVehicleRepository();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserFavoriteVehicleService,
        {
          provide: FavoriteVehicleRepository,
          useValue: userFavoriteVehicleRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserFavoriteVehicleService>(UserFavoriteVehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFavoriteVehicles', () => {
    it('should return an array of SyncedVehicleEntity and call to method findVehiclesByUser from repository', async () => {
      const fakeUserId = 99;
      const vehiclesResponseMock = buildVehiclesMock({ pattern: 'toyota' });
      jest
        .spyOn(userFavoriteVehicleRepositoryMock, 'findVehiclesByUser')
        .mockResolvedValue(vehiclesResponseMock);

      const result = await service.getAllFavoriteVehicles(fakeUserId);

      expect(result).toSatisfyAll((vehicle) => {
        expect(vehicle).toBeInstanceOf(SyncedVehicleEntity);
        return true;
      });
      expect(userFavoriteVehicleRepositoryMock.findVehiclesByUser).toHaveBeenCalledTimes(
        1,
      );
      expect(userFavoriteVehicleRepositoryMock.findVehiclesByUser).toHaveBeenCalledWith(
        fakeUserId,
      );
    });
  });

  describe('addFavoriteVehicleToUser', () => {
    it('should return SyncedVehicleEntity and call to method addFavoriteVehicleToUser from repository', async () => {
      const fakeVehicleUUID = '4486c487-50b3-4b78-a98a-eb1678be4967';
      const fakeUserId = 99;
      const [vehicleResponseMock] = buildVehiclesMock({ pattern: 'toyota', size: 1 });
      jest
        .spyOn(userFavoriteVehicleRepositoryMock, 'addFavoriteVehicleToUser')
        .mockResolvedValue(vehicleResponseMock);

      const result = await service.addFavoriteVehicleToUser(
        {
          vehicle: { uuid: fakeVehicleUUID },
        },
        fakeUserId,
      );

      expect(result).toBeInstanceOf(SyncedVehicleEntity);
      expect(
        userFavoriteVehicleRepositoryMock.addFavoriteVehicleToUser,
      ).toHaveBeenCalledTimes(1);
      expect(
        userFavoriteVehicleRepositoryMock.addFavoriteVehicleToUser,
      ).toHaveBeenCalledWith({
        userId: fakeUserId,
        vehicleUUID: fakeVehicleUUID,
      });
    });
  });

  describe('deleteFavoriteVehicleToUser', () => {
    it('should return an array of SyncedVehicleEntity and call to method deleteFavoriteVehicleToUser from repository', async () => {
      const fakeVehicleUUID = '9c902176-e724-4018-9a4d-423bb4cce4fd';
      const fakeUserId = 99;
      const vehiclesResponseMock = buildVehiclesMock({ pattern: 'toyota' });
      jest
        .spyOn(userFavoriteVehicleRepositoryMock, 'deleteFavoriteVehicleToUser')
        .mockResolvedValue(vehiclesResponseMock);

      const result = await service.deleteFavoriteVehicleToUser(
        {
          vehicle: { uuid: fakeVehicleUUID },
        },
        fakeUserId,
      );

      expect(result).toSatisfyAll((vehicle) => {
        expect(vehicle).toBeInstanceOf(SyncedVehicleEntity);
        return true;
      });
      expect(
        userFavoriteVehicleRepositoryMock.deleteFavoriteVehicleToUser,
      ).toHaveBeenCalledTimes(1);
      expect(
        userFavoriteVehicleRepositoryMock.deleteFavoriteVehicleToUser,
      ).toHaveBeenCalledWith({
        userId: fakeUserId,
        vehicleUUID: fakeVehicleUUID,
      });
    });
  });
});
