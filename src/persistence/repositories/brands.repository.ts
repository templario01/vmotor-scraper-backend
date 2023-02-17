import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<Brand[]> {
    return this.prisma.brand.findMany();
  }

  async findByName(name: string): Promise<Brand> {
    return this.prisma.brand.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async create(name: string): Promise<Brand> {
    return this.prisma.brand.create({
      data: {
        name,
      },
    });
  }

  async upsert(name: string, models?: string[]): Promise<Brand> {
    return this.prisma.brand.upsert({
      where: {
        name,
      },
      update: {
        name,
        ...(models?.length > 0 && {
          models: {
            createMany: {
              skipDuplicates: true,
              data: models.map((name) => ({ name })),
            },
          },
        }),
      },
      create: {
        name,
        ...(models?.length > 0 && {
          models: { create: models.map((name) => ({ name })) },
        }),
      },
    });
  }
}
