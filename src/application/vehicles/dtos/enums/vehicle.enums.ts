import { registerEnumType } from '@nestjs/graphql';

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  ALL = 'ALL',
}

export enum NeoautoVehicleConditionEnum {
  NEW = 'nuevos',
  USED = 'usados',
}

export enum VehicleStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(VehicleCondition, {
  name: 'VehicleCondition',
  description: 'Vehicle condition',
});
