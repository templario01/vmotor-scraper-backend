import { Prisma } from '@prisma/client';

export type PartialUser = Prisma.UserGetPayload<{
  select: {
    hasConfirmedEmail: true;
    password: true;
    email: true;
    id: true;
  };
}>;
