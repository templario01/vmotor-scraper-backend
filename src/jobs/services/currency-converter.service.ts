import { AxiosResponse } from 'axios';
import {
  CurrencyConverterRequest,
  CurrencyConverterResponse,
} from './types/currency-converter';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CurrencyConverterApiService {
  private readonly logger = new Logger(CurrencyConverterApiService.name);
  private readonly apiUrl = process.env.FOREX_API_URL;
  private readonly apikey = process.env.FOREX_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async convertCurrency(request: CurrencyConverterRequest): Promise<string | number> {
    try {
      const { from, to } = request;
      const url = `${this.apiUrl}/aggs/ticker/C:${from}${to}/prev`;
      const { data }: Awaited<AxiosResponse<CurrencyConverterResponse>> =
        await lastValueFrom(
          this.httpService.get(url, {
            params: { adjusted: true },
            headers: { Authorization: `Bearer ${this.apikey}` },
          }),
        );

      return data.results[0].c;
    } catch (error) {
      this.logger.error('request failed', error);
      return undefined;
    }
  }
}
