import { Injectable } from '@nestjs/common';
import { SearchRepository } from '../../../persistence/repositories/search.repository';
import {
  PaginatedUserSearchEntity,
  UserSearchEntity,
} from '../entities/user-search.entity';
import { DeleteSearchInput } from '../inputs/delete-search.input';
import { plainToInstance } from 'class-transformer';
import { GetUserSearchArgs } from '../inputs/get-searches.input';

import { Prisma } from '@prisma/client';

@Injectable()
export class UserSearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async getSearchHistory(
    userId: number,
    params: GetUserSearchArgs,
  ): Promise<PaginatedUserSearchEntity> {
    const where: Prisma.SearchWhereInput = {
      user: {
        id: userId,
      },
    };

    return this.searchRepository.findSearches({ ...params, where });
  }

  async deleteSearch(
    input: DeleteSearchInput,
    userId: number,
  ): Promise<UserSearchEntity[]> {
    const { search } = input;
    const result = await this.searchRepository.delete(userId, search.uuid);

    return plainToInstance(UserSearchEntity, result);
  }
}
