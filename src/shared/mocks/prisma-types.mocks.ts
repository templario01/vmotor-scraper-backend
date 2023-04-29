import {
  randEmail,
  randHexaDecimal,
  randNumber,
  randPastDate,
  randSoonDate,
  randUuid,
} from '@ngneat/falso';
import { EmailValidationCode, User } from '@prisma/client';

export const buildUserMock = ({
  email = randEmail(),
  hasConfirmedEmail = true,
}: {
  email?: string;
  hasConfirmedEmail?: boolean;
}): User => ({
  email,
  hasConfirmedEmail,
  id: randNumber(),
  password: randHexaDecimal(),
  lastSession: randPastDate(),
  refreshToken: randUuid(),
  uuid: randUuid(),
});

export const buildValidationCodeMock = (): EmailValidationCode => ({
  code: 'AX34F2',
  id: randNumber(),
  updatedAt: randPastDate(),
  createdAt: randPastDate(),
  expirationTime: randSoonDate(),
  userId: randNumber(),
  uuid: randUuid(),
});
