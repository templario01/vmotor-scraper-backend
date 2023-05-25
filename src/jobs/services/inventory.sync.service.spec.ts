import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { InventorySyncService } from './inventory.sync.service';
import { ScheduleModule } from '@nestjs/schedule';
import { NeoAutoSyncService } from './neo-auto-sync.service';
import { MercadolibreSyncService } from './mercadolibre-sync.service';
import {
  buildAutocosmosSyncServiceMock,
  buildEnvConfigServiceMock,
  buildMercadolibreSyncServiceMock,
  buildNeoautoSyncServiceMock,
  buildProxyServiceMock,
} from '../../shared/test-utils/providers.mock';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { ProxyService } from '../../application/proxy/proxy.service';
import { AutocosmosSyncService } from './autocosmos-sync.service';
import { AutocosmosVehicleConditionEnum } from '../../application/autocosmos/enums/atocosmos.enum';
import { NeoautoVehicleConditionEnum } from '../../application/neoauto/enums/neoauto.enum';

describe('InventorySyncService', () => {
  let service: InventorySyncService;
  let module: TestingModule;
  let proxyIpMock: string;
  const proxyServiceMock = buildProxyServiceMock();
  const envConfigServiceMock = buildEnvConfigServiceMock();
  const neoautoSyncServiceMock = buildNeoautoSyncServiceMock();
  const mercadolibreSyncServiceMock = buildMercadolibreSyncServiceMock();
  const autocosmosSyncServiceMock = buildAutocosmosSyncServiceMock();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [HttpModule, ScheduleModule.forRoot()],
      providers: [
        InventorySyncService,
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        { provide: ProxyService, useValue: proxyServiceMock },
        { provide: NeoAutoSyncService, useValue: neoautoSyncServiceMock },
        { provide: MercadolibreSyncService, useValue: mercadolibreSyncServiceMock },
        { provide: AutocosmosSyncService, useValue: autocosmosSyncServiceMock },
      ],
    }).compile();

    service = module.get<InventorySyncService>(InventorySyncService);
  });

  beforeAll(async () => {
    const { host, port } = await proxyServiceMock.getProxy();
    proxyIpMock = `${host}:${port}`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncAllInventory', () => {
    it('should call to sync methods without proxy if the environment is different to production', async () => {
      await service.syncAllInventory();

      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledTimes(1);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledWith(undefined);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.NEW,
        undefined,
      );
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.USED,
        undefined,
      );
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        AutocosmosVehicleConditionEnum.NEW,
        undefined,
      );
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        AutocosmosVehicleConditionEnum.USED,
        undefined,
      );
    });

    it('should call to sync methods using proxy if the environment is production', async () => {
      jest
        .spyOn(envConfigServiceMock, 'app')
        .mockReturnValue({ environment: Environment.PROD, appHost: 'fake-url' });

      await service.syncAllInventory();

      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledTimes(1);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledTimes(2);
      expect(mercadolibreSyncServiceMock.syncInventory).toHaveBeenCalledWith(proxyIpMock);
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.NEW,
        proxyIpMock,
      );
      expect(neoautoSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        NeoautoVehicleConditionEnum.USED,
        proxyIpMock,
      );
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        AutocosmosVehicleConditionEnum.NEW,
        proxyIpMock,
      );
      expect(autocosmosSyncServiceMock.syncInventory).toHaveBeenCalledWith(
        AutocosmosVehicleConditionEnum.USED,
        proxyIpMock,
      );
    });
  });
});
