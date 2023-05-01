import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { HttpService } from '@nestjs/axios';
import { EphemeralProxyResponse, EphemeralProxy } from './dtos/ephemeral-proxy.response';
import { PubProxy, PubProxyResponse } from './dtos/pub-proxy.dto';
import { ProxyRepository } from '../../persistence/repositories/proxy.repository';
import { Proxy } from './dtos/proxy.dto';

const proxyCountries = ['US', 'BR', 'PE'];

@Injectable()
export class ProxyService {
  protected ephemeralProxyUrl: string;
  protected ephemeralProxyHost: string;
  protected pubProxyUrl: string;
  private rapidapiKey: string;
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfigService: EnvConfigService,
    private readonly proxyRepository: ProxyRepository,
  ) {
    const { apiKey } = this.envConfigService.rapidApi();
    const { host, url: EP_URL } = this.envConfigService.ephemeralProxiesApi();
    const { url: PU_URL } = this.envConfigService.pubProxy();
    this.rapidapiKey = apiKey;
    this.ephemeralProxyHost = host;
    this.ephemeralProxyUrl = EP_URL;
    this.pubProxyUrl = PU_URL;
  }

  async getEphemeralProxy(): Promise<EphemeralProxy> {
    try {
      const result = await this.httpService.axiosRef.get<EphemeralProxyResponse>(
        `${this.ephemeralProxyUrl}/datacenter/proxy`,
        {
          headers: {
            'X-RapidAPI-Key': this.rapidapiKey,
            'X-RapidAPI-Host': this.ephemeralProxyHost,
          },
          params: {
            countries: proxyCountries.join(','),
          },
        },
      );

      if (result?.status !== 200) return undefined;

      const {
        data: { proxy },
      } = result;

      return proxy;
    } catch (error) {
      this.logger.error({ error, msg: 'fail to get proxy from Ephemeral Proxies API' });

      return undefined;
    }
  }

  async getPubProxy(): Promise<PubProxy> {
    try {
      const result = await this.httpService.axiosRef.get<PubProxyResponse>(
        `${this.pubProxyUrl}/proxy?country=${proxyCountries.join(',')}`,
      );

      if (result?.status !== 200) return undefined;

      const {
        data: {
          data: [proxy],
        },
      } = result;

      return proxy;
    } catch (error) {
      this.logger.error({ error, msg: 'fail to get proxy from Pub Proxy API' });

      return undefined;
    }
  }

  async getProxy(): Promise<Proxy | undefined> {
    const savedProxy = await this.proxyRepository.get();
    if (savedProxy) return { host: savedProxy.host, port: savedProxy.port };

    const apiProxy = await this.getEphemeralProxy();
    if (apiProxy) {
      const savedProxy = await this.proxyRepository.save(apiProxy);
      return { host: savedProxy.host, port: savedProxy.port };
    }

    const activeProxy = await this.getPubProxy();
    const pubProxy = activeProxy ? this.verifyPubProxyStatus(activeProxy) : undefined;

    return pubProxy
      ? {
          host: pubProxy.ip,
          port: parseInt(pubProxy.port),
        }
      : undefined;
  }

  private verifyPubProxyStatus(proxy: PubProxy): PubProxy {
    const { last_checked } = proxy;
    const lastCheckedTime = new Date(last_checked);
    const currentTime = Date.now();
    const lastHourTime = currentTime - 3600 * 1000;

    if (lastCheckedTime.getTime() < lastHourTime) return undefined;

    return proxy;
  }
}
