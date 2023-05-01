import { Injectable } from '@nestjs/common';
import { AbstractFactory } from './abstract-factory';
import { Condition, Currency, Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../../persistence/services/prisma.service';
import {
  randAmount,
  randCity,
  randNumber,
  randPastDate,
  randUrl,
  randWord,
} from '@ngneat/falso';

type VehicleInput = Partial<Prisma.VehicleCreateInput>;

@Injectable()
export class VehicleFactory extends AbstractFactory<Vehicle> {
  constructor(protected readonly prismaClient: PrismaService) {
    super();
  }

  async make(input: VehicleInput = {}): Promise<Vehicle> {
    return this.prismaClient.vehicle.create({
      data: {
        url: input.url ?? randUrl(),
        price: input.price ?? new Prisma.Decimal(randAmount()),
        description: input.description ?? randWord(),
        doors: input.doors ?? randNumber({ max: 8 }),
        engineFuelType: input.engineFuelType ?? randWord(),
        enginePowerHp: input.enginePowerHp ?? randWord(),
        enginePowerRpm: input.enginePowerRpm ?? randWord(),
        engineType: input.engineType ?? randWord(),
        frontImage: input.frontImage ?? randUrl(),
        images: input.images ?? `${(randUrl(), randUrl(), randUrl())}`,
        location: input.location ?? randCity(),
        mileage: input.mileage ?? new Prisma.Decimal(randNumber({ min: 10000 })),
        externalId:
          input.externalId ?? randNumber({ min: 10000, max: 100000 }).toString(),
        originalPrice: input.originalPrice ?? new Prisma.Decimal(randAmount()),
        speeds: input.speeds ?? randNumber({ max: 10 }),
        transmission: input.transmission ?? randWord(),
        year: input.year ?? randPastDate().getFullYear(),
        condition: input.condition ?? Condition.USED,
        currency: input.currency ?? Currency.USD,
        website: input.website,
      },
    });
  }

  async makeMany(factorial: number, input: VehicleInput): Promise<Vehicle[]> {
    return Promise.all([...Array(factorial)].map(() => this.make(input)));
  }
}
