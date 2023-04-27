import { Prisma } from '@prisma/client';

export type VehicleWithRelation = Prisma.VehicleGetPayload<{
  readonly include: {
    readonly website: true;
  };
}>;
