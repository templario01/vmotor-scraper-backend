import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { encryptPassword } from '../../shared/utils/user.utils';
import { CreateAccountDto } from '../../application/auth/dtos/auth.dto';
import { User } from '@prisma/client';
import { generateEmailCode } from '../../shared/utils/auth.utils';

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

  async findVerifiedUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        hasConfirmedEmail: true,
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

  async findUserByUUID(uuid: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        uuid,
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

  async createValidationCode(userId: number) {
    const { currentTime, MINUTES, MILISECONDS } = {
      currentTime: new Date(),
      MINUTES: 5,
      MILISECONDS: 60000,
    };
    const expirationTime = new Date(currentTime.getTime() + MINUTES * MILISECONDS);
    const code = await generateEmailCode(this.prisma);

    const newCode = await this.prisma.emailValidationCode.create({
      data: {
        userId,
        code,
        expirationTime,
      },
    });

    console.log(newCode);

    return newCode;
  }

  async findLastValidationCode(userId: number) {
    return this.prisma.emailValidationCode.findFirst({
      where: {
        userId,
      },
    });
  }

  async validateAccount(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { hasConfirmedEmail: true },
    });
  }
}
