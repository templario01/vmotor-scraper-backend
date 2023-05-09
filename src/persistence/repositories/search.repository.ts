import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Search } from '@prisma/client';
import { UserVehicleSearchDto } from '../../application/user/dtos/user-vehicle-search.dto';
import { IEdgeType } from '../../shared/utils/pagination/cursor-pagination';
import {
  IPaginatedUserSearchesEntity,
  UserSearchEntity,
} from '../../application/user/entities/user-search.entity';
import { GetSearchesArgs } from '../../application/user/inputs/get-searches.input';

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

  async findByUser(
    params: GetSearchesArgs,
    userId: number,
  ): Promise<IPaginatedUserSearchesEntity> {
    const { take, after } = params;
    const where: Prisma.SearchWhereInput = { user: { id: userId } };
    const totalCount = await this.prisma.search.count({ where });
    const searches = await this.prisma.search.findMany({
      where,
      take: typeof take === 'number' ? take + 1 : undefined,
      skip: after ? 1 : undefined,
      cursor: after ? { uuid: after } : undefined,
      orderBy: [{ createdAt: 'desc' }],
    });

    const results = searches.map(({ text, uuid, createdAt }) => ({
      text,
      uuid,
      createdAt,
    }));

    const hasNextPage = typeof take === 'number' ? results.length > take : false;
    if (hasNextPage) results.pop();

    const lastItem = results[results?.length - 1];
    const endCursor = lastItem?.uuid;
    const edges = results.map<IEdgeType<UserSearchEntity>>((vehicle) => ({
      cursor: vehicle.uuid,
      node: vehicle,
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
