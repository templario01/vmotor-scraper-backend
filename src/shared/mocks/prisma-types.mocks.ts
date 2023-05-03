import {
  randAmount,
  randCity,
  randEmail,
  randHexaDecimal,
  randNumber,
  randPastDate,
  randSoonDate,
  randUrl,
  randUuid,
  randWord,
} from '@ngneat/falso';
import {
  Condition,
  Currency,
  EmailValidationCode,
  Prisma,
  Status,
  User,
  Vehicle,
} from '@prisma/client';

export const buildUserMock = ({
  email = randEmail(),
  hasConfirmedEmail = true,
  hasActiveNotifications = true,
}: {
  email?: string;
  hasConfirmedEmail?: boolean;
  hasActiveNotifications?: boolean;
}): User => ({
  email,
  hasConfirmedEmail,
  hasActiveNotifications,
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

export const buildVehiclesMock = ({
  pattern,
  size = 5,
}: {
  pattern: string;
  size?: number;
}): Vehicle[] => {
  return Array.from({ length: size }, (_, index) => ({
    id: index,
    uuid: randUuid(),
    url: randUrl(),
    price: new Prisma.Decimal(randAmount()),
    description: `${pattern} ${randWord()}`,
    status: Status.ACTIVE,
    doors: randNumber({ max: 8 }),
    engineFuelType: randWord(),
    enginePowerHp: randWord(),
    enginePowerRpm: randWord(),
    engineType: randWord(),
    frontImage: randUrl(),
    images: randUrl(),
    location: randCity(),
    mileage: new Prisma.Decimal(randNumber({ min: 10000 })),
    externalId: randNumber({ min: 10000, max: 100000 }).toString(),
    originalPrice: new Prisma.Decimal(randAmount()),
    speeds: randNumber({ max: 10 }),
    transmission: randWord(),
    websiteId: randNumber(),
    year: randPastDate().getFullYear(),
    createdAt: randPastDate(),
    updatedAt: randPastDate(),
    condition: Condition.NEW,
    currency: Currency.USD,
  }));
};
