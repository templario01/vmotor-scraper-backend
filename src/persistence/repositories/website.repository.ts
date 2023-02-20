import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Website } from '@prisma/client';

@Injectable()
export class WebsiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<Website[]> {
    return this.prisma.website.findMany();
  }

  async findByName(name: string): Promise<Website> {
    return this.prisma.website.findUnique({
      where: {
        name,
      },
    });
  }
}
