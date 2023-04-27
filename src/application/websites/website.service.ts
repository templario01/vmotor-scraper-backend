import { Injectable } from '@nestjs/common';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import { WebsiteEntity } from './entities/website.entity';
import { Status } from '../../shared/dtos/status.enum';

@Injectable()
export class WebsiteService {
  constructor(private readonly websiteRepository: WebsiteRepository) {}

  async getWebsite(id: number): Promise<WebsiteEntity> {
    const { status, ...props } = await this.websiteRepository.findById(id);

    return {
      ...props,
      status: Status[status],
    };
  }
}
