import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { HttpService } from '@nestjs/axios';
import { EphemeralProxyResponse, Proxy } from './dtos/ephemeral-proxy.response';

const proxyCountries = ['US', 'BR', 'PE'];

@Injectable()
export class ProxyApiV2Service {
  private url: string;
  private host: string;
  private rapidapiKey: string;
  private readonly logger = new Logger(ProxyApiV2Service.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly envConfigService: EnvConfigService,
  ) {
    const { apiKey } = this.envConfigService.rapidApi();
    const { host, url } = this.envConfigService.ephemeralProxiesApi();
    this.rapidapiKey = apiKey;
    this.host = host;
    this.url = url;
  }

  async getProxy(): Promise<Proxy> {
    try {
      const {
        data: { proxy },
      } = await this.httpService.axiosRef.get<EphemeralProxyResponse>(
        `${this.url}/datacenter/proxy`,
        {
          headers: {
            'X-RapidAPI-Key': this.rapidapiKey,
            'X-RapidAPI-Host': this.host,
          },
          params: {
            countries: proxyCountries.join(','),
          },
        },
      );

      return proxy;
    } catch (error) {
      this.logger.error({ error, msg: 'fail to get proxy from Ephemeral Proxies API' });

      return undefined;
    }
  }
}
