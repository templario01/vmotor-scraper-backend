import { Prisma } from '@prisma/client';

export interface GetUserSearchWhereInputDto {
  readonly take?: number;
  readonly after?: string;
  readonly where?: Prisma.SearchWhereInput;
}
