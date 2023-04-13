import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { HttpService } from '@nestjs/axios';
import {
  CurrencyConverterRequest,
  CurrencyConverterResponse,
} from './dtos/currency-converter.dto';
import { catchError, lastValueFrom } from 'rxjs';

const CURRENCY_UNIT_VALUE = 1;

@Injectable()
export class CurrencyConverterApiService {
  private url: string;
  private host: string;
  private rapidapiKey: string;
  private readonly logger = new Logger(CurrencyConverterApiService.name);
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

  async convertCurrency({
    from,
    to,
  }: CurrencyConverterRequest): Promise<CurrencyConverterResponse> {
    try {
      const URL = `${this.url}/convertcurrency`;
      const { data } = await lastValueFrom(
        this.httpService
          .get<CurrencyConverterResponse>(URL, {
            headers: {
              'X-RapidAPI-Key': this.rapidapiKey,
              'X-RapidAPI-Host': this.host,
            },
            params: {
              have: from,
              want: to,
              amount: CURRENCY_UNIT_VALUE.toString(),
            },
          })
          .pipe(
            catchError((error) => {
              throw new Error(error);
            }),
          ),
      );

      return data;
    } catch (error) {
      this.logger.error('request failed', error);
      return null;
    }
  }
}
