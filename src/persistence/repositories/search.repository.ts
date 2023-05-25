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
import { GetUserSearchWhereInputDto } from '../../application/user/dtos/get-user-search.dto';
import {
  IPaginatedUserSearchEntity,
  UserSearchEntity,
} from '../../application/user/entities/user-search.entity';
import { IEdgeType } from '../../shared/utils/pagination/cursor-pagination';

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

  async findSearches(
    params: GetUserSearchWhereInputDto,
  ): Promise<IPaginatedUserSearchEntity> {
    const { take, after, where } = params;
    const totalCount = await this.prisma.search.count({ where });
    const searches = await this.prisma.search.findMany({
      where,
      take: typeof take === 'number' ? take + 1 : undefined,
      skip: after ? 1 : undefined,
      cursor: after ? { uuid: after } : undefined,
    });

    const results = searches.map(({ uuid, createdAt, text }) => ({
      uuid,
      createdAt,
      text,
    }));

    const hasNextPage = typeof take === 'number' ? results.length > take : false;
    if (hasNextPage) results.pop();

    const lastItem = results[results?.length - 1];
    const endCursor = lastItem?.uuid;
    const edges = results.map<IEdgeType<UserSearchEntity>>((search) => ({
      cursor: search.uuid,
      node: search,
    }));

    return {
      edges,
      nodes: results,
      hasNextPage,
      endCursor,
      totalCount,
    };
  }
}
