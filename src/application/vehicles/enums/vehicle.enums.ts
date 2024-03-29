import { registerEnumType } from '@nestjs/graphql';

export enum GetVehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  ALL = 'ALL',
}

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
}

export enum VehicleStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum PriceCurrency {
  USD = 'USD',
  PEN = 'PEN',
}

registerEnumType(GetVehicleCondition, {
  name: 'GetVehicleCondition',
  description: 'Vehicle condition',
});

registerEnumType(VehicleCondition, {
  name: 'VehicleCondition',
  description: 'NEW or USED',
});

registerEnumType(PriceCurrency, {
  name: 'PriceCurrency',
  description: 'USD or PEN',
});

registerEnumType(VehicleCondition, {
  name: 'VehicleCondition',
  description: 'NEW or USED',
});

export const typeofPriceCurrency = () => PriceCurrency;
export const typeofVehicleCondition = () => GetVehicleCondition;
