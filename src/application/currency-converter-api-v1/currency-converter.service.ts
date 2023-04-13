import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { HttpService } from '@nestjs/axios';
import { CurrencyConverterResponse } from './dtos/currency-converter.response';

const CURRENCY_UNIT_VALUE = 1;

@Injectable()
export class CurrencyConverterApiService {
  private url: string;
  private host: string;
  private rapidapiKey: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly envConfigService: EnvConfigService,
  ) {
    const { apiKey } = this.envConfigService.rapidApi();
    const { host, url } = this.envConfigService.currencyConverterApi();
    this.rapidapiKey = apiKey;
    this.host = host;
    this.url = url;
  }

  async convertCurrency({ from, to }: { from: string; to: string }) {
    const URL = `${this.url}/convertcurrency`;
    const { data } = await this.httpService.axiosRef.get<CurrencyConverterResponse>(URL, {
      headers: {
        'X-RapidAPI-Key': this.rapidapiKey,
        'X-RapidAPI-Host': this.host,
      },
      params: {
        have: from,
        want: to,
        unit: CURRENCY_UNIT_VALUE.toString(),
      },
    });

    return data;
  }
}
