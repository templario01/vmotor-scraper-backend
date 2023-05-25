import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { encryptPassword } from '../../shared/utils/user.utils';
import { CreateAccountDto } from '../../application/auth/dtos/auth.dto';
import { User } from '@prisma/client';
import { generateEmailCode } from '../../shared/utils/auth.utils';
import { PartialUser } from '../../application/user/types/user.types';

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

  async findUserByEmailCode(code: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        validationCodes: {
          some: {
            code,
            expirationTime: {
              gt: new Date(),
            },
          },
        },
      },
    });
  }

  async registerSession(id: number) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        lastSession: new Date(),
      },
      select: {
        uuid: true,
        email: true,
        lastSession: true,
      },
    });
  }

  async findUserById(id: number): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        id,
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

  async createAccount({ email, password }: CreateAccountDto): Promise<PartialUser> {
    const passwordEncrypted = await encryptPassword(password);

    return this.prisma.user.create({
      data: {
        email,
        hasConfirmedEmail: false,
        password: passwordEncrypted,
      },
    });
  }

  async createValidationCode(userId: number) {
    const { currentTime, MINUTES, MILISECONDS } = {
      currentTime: new Date(),
      MINUTES: 5,
      MILISECONDS: 60000,
    };
    const expirationTime = new Date(currentTime.getTime() + MINUTES * MILISECONDS);
    const code = await generateEmailCode(this.prisma);

    return this.prisma.emailValidationCode.create({
      data: {
        userId,
        code,
        expirationTime,
      },
    });
  }

  async validateAccount(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { hasConfirmedEmail: true },
    });
  }

  async changeUserNotifications(userId: number, hasActiveNotifications: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        hasActiveNotifications,
      },
      select: {
        hasActiveNotifications: true,
      },
    });
  }
}
