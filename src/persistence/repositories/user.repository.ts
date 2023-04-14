import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { encryptPassword } from '../../shared/utils/user.utils';
import { CreateAccountDto } from '../../application/auth/dtos/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  async findUserByToken(token: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: {
        refreshToken: token,
      },
    });
  }

  async createAccount({ email, password }: CreateAccountDto): Promise<User> {
    const passwordEncrypted = await encryptPassword(password);

    return this.prisma.user.create({
      data: {
        email,
        hasConfirmedEmail: false,
        password: passwordEncrypted,
      },
    });
  }

  async validateAccount(uuid: string): Promise<User> {
    return this.prisma.user.update({
      where: { uuid },
      data: { hasConfirmedEmail: true },
    });
  }
}
