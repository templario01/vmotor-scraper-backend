import { Test, TestingModule } from '@nestjs/testing';
import { buildVehicleRepositoryMock } from '../../shared/test-utils/repositories.mock';
import { VehicleService } from './vehicle.service';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { IPaginatedVehicleEntity } from './entities/synced-vehicle.entity';
import { buildVehiclesMock } from '../../shared/mocks/prisma-types.mocks';
import { randUuid } from '@ngneat/falso';

describe('VehicleService', () => {
  let service: VehicleService;
  let module: TestingModule;
  const vehicleRepositoryMock = buildVehicleRepositoryMock();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: VehicleRepository, useValue: vehicleRepositoryMock },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVehiclesByAdvancedSearch', () => {
    it('should return the valid Object when is called whit all arguments', async () => {
      const args: GetVehiclesArgs = {
        take: 5,
        after: randUuid(),
        searchName: 'mazda 3 2018',
        city: 'arequipa',
      };
      const vehiclesResponseMock = buildVehiclesMock({ pattern: args.searchName });
      const responseMock: IPaginatedVehicleEntity = {
        hasNextPage: true,
        totalCount: vehiclesResponseMock.length,
        endCursor: vehiclesResponseMock[vehiclesResponseMock.length - 1].uuid,
        edges: [],
        nodes: [],
      };
      jest.spyOn(vehicleRepositoryMock, 'findVehicles').mockResolvedValue(responseMock);

      const result = await service.getVehiclesByAdvancedSearch(args);

      expect(result).toMatchObject({
        edges: responseMock.edges,
        endCursor: responseMock.endCursor,
        hasNextPage: responseMock.hasNextPage,
        nodes: responseMock.nodes,
        totalCount: responseMock.totalCount,
      });
    });

    it('should return the valid Object when is called just with searchName', async () => {
      const args: GetVehiclesArgs = {
        take: 5,
        searchName: 'mazda 3 2018',
      };
      const vehiclesResponseMock = buildVehiclesMock({ pattern: args.searchName });
      const responseMock: IPaginatedVehicleEntity = {
        hasNextPage: true,
        totalCount: vehiclesResponseMock.length,
        endCursor: vehiclesResponseMock[vehiclesResponseMock.length - 1].uuid,
        edges: [],
        nodes: [],
      };
      jest.spyOn(vehicleRepositoryMock, 'findVehicles').mockResolvedValue(responseMock);

      const result = await service.getVehiclesByAdvancedSearch(args);

      expect(result).toMatchObject({
        edges: responseMock.edges,
        endCursor: responseMock.endCursor,
        hasNextPage: responseMock.hasNextPage,
        nodes: responseMock.nodes,
        totalCount: responseMock.totalCount,
      });
    });

    it('should return the valid Object when is called without args', async () => {
      const vehiclesResponseMock = buildVehiclesMock({ pattern: '' });
      const responseMock: IPaginatedVehicleEntity = {
        hasNextPage: true,
        totalCount: vehiclesResponseMock.length,
        endCursor: vehiclesResponseMock[vehiclesResponseMock.length - 1].uuid,
        edges: [],
        nodes: [],
      };
      jest.spyOn(vehicleRepositoryMock, 'findVehicles').mockResolvedValue(responseMock);

      const result = await service.getVehiclesByAdvancedSearch({});

      expect(result).toMatchObject({
        edges: responseMock.edges,
        endCursor: responseMock.endCursor,
        hasNextPage: responseMock.hasNextPage,
        nodes: responseMock.nodes,
        totalCount: responseMock.totalCount,
      });
    });
  });
});
