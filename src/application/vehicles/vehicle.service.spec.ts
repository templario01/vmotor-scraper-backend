import { Test, TestingModule } from '@nestjs/testing';
import {
  buildSearchRepository,
  buildVehicleRepositoryMock,
} from '../../shared/test-utils/repositories.mock';
import { VehicleService } from './vehicle.service';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { GetVehiclesArgs } from './inputs/get-vehicles.input';
import { IPaginatedVehicleEntity } from './entities/synced-vehicle.entity';
import { buildVehiclesMock } from '../../shared/mocks/prisma-types.mocks';
import { randUuid } from '@ngneat/falso';
import { SearchRepository } from '../../persistence/repositories/search.repository';
import { GetVehicleCondition } from './enums/vehicle.enums';

describe('VehicleService', () => {
  let service: VehicleService;
  let module: TestingModule;
  const vehicleRepositoryMock = buildVehicleRepositoryMock();
  const searchRepositoryMock = buildSearchRepository();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: VehicleRepository, useValue: vehicleRepositoryMock },
        { provide: SearchRepository, useValue: searchRepositoryMock },
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
    it('should return the valid Object and not create a search when is called with all args but without userId', async () => {
      const args: GetVehiclesArgs = {
        take: 5,
        after: randUuid(),
        searchName: 'mazda 3 2018',
        city: 'arequipa',
        condition: GetVehicleCondition.NEW,
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
      expect(vehicleRepositoryMock.findVehicles).toHaveBeenCalledWith({
        after: expect.any(String),
        take: 5,
        where: {
          AND: [
            { description: { contains: 'mazda', mode: 'insensitive' } },
            { description: { contains: '3', mode: 'insensitive' } },
            { year: { equals: 2018 } },
            { location: { contains: 'arequipa', mode: 'insensitive' } },
            { condition: { equals: 'NEW' } },
          ],
        },
      });
      expect(searchRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should return the valid Object and create a new search when is called with all args including userId', async () => {
      const args: GetVehiclesArgs = {
        take: 5,
        after: randUuid(),
        searchName: 'honda civic 2023',
        city: 'lima',
        condition: GetVehicleCondition.NEW,
      };
      const fakeUserId = 999;
      const vehiclesResponseMock = buildVehiclesMock({ pattern: args.searchName });
      const responseMock: IPaginatedVehicleEntity = {
        hasNextPage: true,
        totalCount: vehiclesResponseMock.length,
        endCursor: vehiclesResponseMock[vehiclesResponseMock.length - 1].uuid,
        edges: [],
        nodes: [],
      };
      jest.spyOn(vehicleRepositoryMock, 'findVehicles').mockResolvedValue(responseMock);

      const result = await service.getVehiclesByAdvancedSearch(args, fakeUserId);

      expect(result).toMatchObject({
        edges: responseMock.edges,
        endCursor: responseMock.endCursor,
        hasNextPage: responseMock.hasNextPage,
        nodes: responseMock.nodes,
        totalCount: responseMock.totalCount,
      });
      expect(vehicleRepositoryMock.findVehicles).toHaveBeenCalledWith({
        after: expect.any(String),
        take: 5,
        where: {
          AND: [
            { description: { contains: 'honda', mode: 'insensitive' } },
            { description: { contains: 'civic', mode: 'insensitive' } },
            { year: { equals: 2023 } },
            { location: { contains: 'lima', mode: 'insensitive' } },
            { condition: { equals: 'NEW' } },
          ],
        },
      });
      expect(searchRepositoryMock.create).toHaveBeenCalledWith(fakeUserId, {
        search: {
          condition: 'NEW',
          keywords: ['honda', 'civic'],
          location: 'lima',
          year: 2023,
        },
        text: 'honda civic 2023',
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
