import { HttpService } from '@nestjs/axios';
import { NeoAutoSyncService } from '../../jobs/services/neo-auto-sync.service';
import { EnvConfigService } from '../../config/env-config.service';
import { MercadolibreSyncService } from '../../jobs/services/mercadolibre-sync.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../../application/mailer/mailer.service';
import { ProxyService } from '../../application/proxy/proxy.service';
import { AutocosmosSyncService } from '../../jobs/services/autocosmos-sync.service';

export const buildNestHttpServiceMock = () => {
  const nestHttpService = jest.mocked<HttpService>(HttpService as any, true);
  const axiosRef = {
    request: jest.fn(),
    getUri: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    options: jest.fn(),
    head: jest.fn(),
    delete: jest.fn(),
    patchForm: jest.fn(),
    putForm: jest.fn(),
    postForm: jest.fn(),
  };
  nestHttpService.axiosRef = axiosRef as any;

  return nestHttpService;
};

export const buildNeoautoSyncServiceMock = () => {
  const neoautoSyncService = jest.mocked<NeoAutoSyncService>(
    NeoAutoSyncService as any,
    true,
  );
  neoautoSyncService.syncInventory = jest.fn();

  return neoautoSyncService;
};

export const buildMercadolibreSyncServiceMock = () => {
  const mercadolibreSyncService = jest.mocked<MercadolibreSyncService>(
    MercadolibreSyncService as any,
    true,
  );
  mercadolibreSyncService.syncInventory = jest.fn();

  return mercadolibreSyncService;
};

export const buildAutocosmosSyncServiceMock = () => {
  const autocosmosSyncService = jest.mocked<AutocosmosSyncService>(
    AutocosmosSyncService as any,
    true,
  );
  autocosmosSyncService.syncInventory = jest.fn();

  return autocosmosSyncService;
};

export const buildEnvConfigServiceMock = () => {
  const envConfigService = jest.mocked<EnvConfigService>(EnvConfigService as any, true);
  envConfigService.app = jest
    .fn()
    .mockReturnValue({ environment: 'test', appHost: 'fake-url.com' });
  envConfigService.ephemeralProxiesApi = jest.fn().mockReturnValue({
    url: 'https://fake-api-url.com',
    host: 'fake-api-host.com',
  });
  envConfigService.mercadolibre = jest
    .fn()
    .mockReturnValue({ url: 'https://fake-mercadolibre-url.com' });
  envConfigService.neoauto = jest
    .fn()
    .mockReturnValue({ url: 'https://fake-neoauto-url.com' });

  return envConfigService;
};

export const buildJwtServiceMock = () => {
  const jwtService = jest.mocked<JwtService>(JwtService as any, true);
  jwtService.signAsync = jest.fn();
  jwtService.verifyAsync = jest.fn();

  return jwtService;
};

export const buildMailerServiceMock = () => {
  const mailerService = jest.mocked<MailerService>(MailerService as any, true);
  mailerService.sendEmailConfirmation = jest.fn();

  return mailerService;
};

export const buildProxyServiceMock = () => {
  const proxyService = jest.mocked<ProxyService>(ProxyService as any, true);
  proxyService.getEphemeralProxy = jest.fn();
  proxyService.getPubProxy = jest.fn();
  proxyService.getProxy = jest.fn().mockResolvedValue({ host: '192.168.1.8', port: 443 });

  return proxyService;
};
