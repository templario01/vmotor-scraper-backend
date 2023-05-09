import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Search } from '@prisma/client';
import { UserVehicleSearchDto } from '../../application/user/dtos/user-vehicle-search.dto';

@Injectable()
export class VehicleSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: UserVehicleSearchDto): Promise<Search> {
    const { text, search } = data;
    return this.prisma.search.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        search: JSON.stringify(search),
        text,
      },
    });
  }

  async findByUser(userId: number): Promise<Search[]> {
    return this.prisma.search.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }
}
