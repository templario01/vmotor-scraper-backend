import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { VehicleSearch } from '@prisma/client';
import { UserVehicleSearchDto } from '../../application/user/dtos/user-vehicle-search.dto';

@Injectable()
export class VehicleSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: UserVehicleSearchDto): Promise<VehicleSearch> {
    const { text, search } = data;
    return this.prisma.vehicleSearch.create({
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
}
