import { Injectable } from '@nestjs/common';
import { AbstractFactory } from './abstract-factory';
import { Prisma, Website } from '@prisma/client';
import { PrismaService } from '../../persistence/services/prisma.service';
import { randUrl, randWord } from '@ngneat/falso';

type WebsiteInput = Partial<Prisma.WebsiteCreateInput>;

@Injectable()
export class WebsiteFactory extends AbstractFactory<Website> {
  constructor(protected readonly prismaClient: PrismaService) {
    super();
  }

  async make(input: WebsiteInput = {}): Promise<Website> {
    return this.prismaClient.website.create({
      data: {
        name: input.name ?? randWord(),
        url: input.url ?? randUrl(),
        vehicle: input?.vehicle,
      },
    });
  }

  async makeMany(factorial: number, input: WebsiteInput): Promise<Website[]> {
    return Promise.all([...Array(factorial)].map(() => this.make(input)));
  }
}
