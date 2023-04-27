import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { InventorySyncService } from './inventory.sync.service';
import { ScheduleModule } from '@nestjs/schedule';
import { NeoAutoSyncService } from './neo-auto-sync.service';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import {
  buildEnvConfigServiceMock,
  buildMercadolibreSyncServiceMock,
  buildNeoautoSyncServiceMock,
  buildNestHttpServiceMock,
} from '../../shared/test-utils/providers.mock';
import { EnvConfigService } from '../../config/env-config.service';
import { buildeEphemeralProxyResponse } from '../../shared/mocks/ephemeral-proxy-api.mock';
import { Environment } from '../../config/dtos/config.dto';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/vehicle.enums';
import { EphemeralProxyResponse } from '../../application/proxy-api-v2/dtos/ephemeral-proxy.response';

describe('InventorySyncService', () => {
  let service: InventorySyncService;
  let module: TestingModule;
  const httpServiceMock = buildNestHttpServiceMock();
  const envConfigServiceMock = buildEnvConfigServiceMock();
  const neoautoSyncServiceMock = buildNeoautoSyncServiceMock();
  const mercadolibreSyncServiceMock = buildMercadolibreSyncServiceMock();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [HttpModule, ScheduleModule.forRoot()],
      providers: [
        InventorySyncService,
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: NeoAutoSyncService, useValue: neoautoSyncServiceMock },
        { provide: MercadolibreSyncService, useValue: mercadolibreSyncServiceMock },
      ],
    }).compile();

    service = module.get<InventorySyncService>(InventorySyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncAllInventory', () => {
    let httpRequestMock;
    let httpResponseMock: EphemeralProxyResponse;

    beforeAll(() => {
      httpResponseMock = buildeEphemeralProxyResponse();
      httpRequestMock = jest
        .spyOn(httpServiceMock.axiosRef, 'get')
        .mockResolvedValue({ data: httpResponseMock });
    });

    it('should call to all sync methods using proxy if the environment is production', async () => {
      const { apiKey, host, url } = envConfigServiceMock.ephemeralProxiesApiUrl();
      const {
        proxy: { host: proxyHost, port },
      } = httpResponseMock;
      const proxyMock = `${proxyHost}:${port}`;
      jest
        .spyOn(envConfigServiceMock, 'app')
        .mockReturnValue({ environment: Environment.PROD });

      await service.syncAllInventory();

      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.USED,
        proxyMock,
      );
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.NEW,
        proxyMock,
      );
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledTimes(1);
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledWith(proxyMock);
      expect(httpRequestMock).toHaveBeenCalledWith(url, {
        headers: {
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey,
        },
        params: { countries: 'US,BR,PE' },
      });
      expect(httpRequestMock).toHaveBeenCalledTimes(1);
    });

    it('should call to all sync methods without proxy if the environment is different to production', async () => {
      jest
        .spyOn(envConfigServiceMock, 'app')
        .mockReturnValue({ environment: Environment.DEV });

      await service.syncAllInventory();

      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.USED,
        undefined,
      );
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.NEW,
        undefined,
      );
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledTimes(1);
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledWith(undefined);
      expect(httpRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('getProxy', () => {
    it('should call to external Api and return Proxy entity', async () => {
      const { apiKey, host, url } = envConfigServiceMock.ephemeralProxiesApiUrl();
      const httpResponseMock = buildeEphemeralProxyResponse();
      const httpRequestMock = jest
        .spyOn(httpServiceMock.axiosRef, 'get')
        .mockResolvedValue({ data: httpResponseMock });

      const result = await service.getProxy();

      expect(httpRequestMock).toHaveBeenCalledWith(url, {
        headers: {
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey,
        },
        params: { countries: 'US,BR,PE' },
      });
      expect(httpRequestMock).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(httpResponseMock.proxy);
    });
  });
});
