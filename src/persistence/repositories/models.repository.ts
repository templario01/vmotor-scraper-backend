import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Model } from '@prisma/client';

@Injectable()
export class ModelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<Model[]> {
    return this.prisma.model.findMany();
  }

  async findByName(name: string): Promise<Model> {
    return this.prisma.model.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async create(name: string, brandName: string): Promise<Model> {
    return this.prisma.model.create({
      data: {
        name,
        Brand: {
          connect: {
            name: brandName,
          },
        },
      },
    });
  }
}
