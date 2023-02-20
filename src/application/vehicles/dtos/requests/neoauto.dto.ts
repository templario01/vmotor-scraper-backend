export interface NeoAutoDto {
  externalId: string;
  url: string;
  description?: string;
  year?: number;
  transmission?: string;
  mileage?: number;
  engineType?: string;
  enginePowerRpm?: number;
  enginePowerHp?: number;
  engineFuelType?: string;
  speeds?: number;
  frontImage?: string;
  images?: string;
  usdPrice?: number;
  penPrice?: number;
}
