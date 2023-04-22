import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(Status, {
  name: 'Status',
  description: 'ACTIVE or INACTIVE',
});

export const statusReturnType = () => Status;
