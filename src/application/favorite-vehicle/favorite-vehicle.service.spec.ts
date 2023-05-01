import { Test, TestingModule } from '@nestjs/testing';
import { buildVehicleRepositoryMock } from '../../shared/test-utils/repositories.mock';
import { FavoriteVehicleService } from './favorite-vehicle.service';
import { FavoriteVehicleRepository } from '../../persistence/repositories/favorite-vehicle.repository';

describe('FavoriteVehicleService', () => {
  let service: FavoriteVehicleService;
  let module: TestingModule;
  const vehicleRepositoryMock = buildVehicleRepositoryMock();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        FavoriteVehicleService,
        { provide: FavoriteVehicleRepository, useValue: vehicleRepositoryMock },
      ],
    }).compile();

    service = module.get<FavoriteVehicleService>(FavoriteVehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
