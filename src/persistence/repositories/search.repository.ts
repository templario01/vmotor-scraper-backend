import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Search } from '@prisma/client';
import { UserVehicleSearchDto } from '../../application/vehicles/dtos/user-vehicle-search.dto';
import { PrismaErrorCodes } from '../../shared/dtos/prisma.dto';

@Injectable()
export class SearchRepository {
  private readonly logger = new Logger(SearchRepository.name);

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

  async delete(userId: number, searchUUID: string): Promise<Search[]> {
    try {
      await this.prisma.search.delete({
        where: {
          uuid: searchUUID,
        },
      });

      return this.prisma.search.findMany({
        where: {
          user: { id: userId },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`fail to delete User search, ${error?.message}`);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.P2025) {
          throw new NotFoundException('Search Not found');
        }
      }

      throw new UnprocessableEntityException(error);
    }
  }

  async findLastSearchesByUser(userId: number): Promise<Search[]> {
    const currentTime = new Date().getTime();
    const timeSixtyDaysAgo = currentTime - 60 * 24 * 60 * 60 * 1000;
    const dateSixtyDaysAgo = new Date(timeSixtyDaysAgo);

    return this.prisma.search.findMany({
      where: {
        user: {
          id: userId,
        },
        createdAt: {
          gte: dateSixtyDaysAgo,
        },
      },
    });
  }

  async findByUser(userId: number): Promise<Search[]> {
    return this.prisma.search.findMany({
      where: {
        user: { id: userId },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }
}
