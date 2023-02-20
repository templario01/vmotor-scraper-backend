import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { BrandsRepository } from './repositories/brands.repository';
import { ModelsRepository } from './repositories/models.repository';
import { WebsiteRepository } from './repositories/website.repository';

const repositories = [BrandsRepository, ModelsRepository, WebsiteRepository];
@Module({
  imports: [],
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class PersistenceModule {}
