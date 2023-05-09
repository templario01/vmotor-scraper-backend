import { Prisma } from '@prisma/client';

export interface GetVehiclesWhereInputDto {
  readonly take?: number;
  readonly after?: string;
  readonly where?: Prisma.VehicleWhereInput;
  readonly hasOrderBy?: boolean;
}
