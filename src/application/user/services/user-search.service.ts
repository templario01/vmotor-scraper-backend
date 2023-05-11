import { Injectable } from '@nestjs/common';
import { SearchRepository } from '../../../persistence/repositories/search.repository';
import { UserSearchEntity } from '../entities/user-search.entity';
import { DeleteSearchInput } from '../inputs/delete-search.input';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserSearchService {
  constructor(private readonly vehicleSearchRepository: SearchRepository) {}

  async getSearchHistory(userId: number): Promise<UserSearchEntity[]> {
    const result = await this.vehicleSearchRepository.findByUser(userId);

    return plainToInstance(UserSearchEntity, result);
  }

  async deleteSearch(
    input: DeleteSearchInput,
    userId: number,
  ): Promise<UserSearchEntity[]> {
    const { search } = input;
    const result = await this.vehicleSearchRepository.delete(userId, search.uuid);

    return plainToInstance(UserSearchEntity, result);
  }
}
