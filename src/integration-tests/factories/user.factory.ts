import { Injectable } from '@nestjs/common';
import { AbstractFactory } from './abstract-factory';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../persistence/services/prisma.service';
import { randEmail, randPassword } from '@ngneat/falso';

type UserInput = Partial<Prisma.UserCreateInput>;

@Injectable()
export class UserFactory extends AbstractFactory<User> {
  constructor(protected readonly prismaClient: PrismaService) {
    super();
  }

  async make(input: UserInput = {}): Promise<User> {
    return this.prismaClient.user.create({
      data: {
        email: input?.email ?? randEmail(),
        password: input?.password ?? randPassword(),
        hasConfirmedEmail: input?.hasConfirmedEmail ?? false,
        validationCodes: input?.validationCodes,
      },
    });
  }

  async makeMany(factorial: number, input: UserInput): Promise<User[]> {
    return Promise.all([...Array(factorial)].map(() => this.make(input)));
  }
}
