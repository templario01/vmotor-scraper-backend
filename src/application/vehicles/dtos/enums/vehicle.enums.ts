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

export enum NeoautoVehicleConditionEnum {
  NEW = 'nuevos',
  USED = 'usados',
}

export enum VehicleStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(GetVehicleCondition, {
  name: 'GetVehicleCondition',
  description: 'Vehicle condition',
});
