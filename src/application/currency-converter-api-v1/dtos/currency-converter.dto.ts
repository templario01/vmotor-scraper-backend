export interface CurrencyConverterResponse {
  readonly new_amount: number;
  readonly new_currency: string;
  readonly old_currency: string;
  readonly old_amount: number;
}

export interface CurrencyConverterRequest {
  from: string;
  to: string;
}
