import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { BrandsRepository } from './repositories/brands.repository';
import { ModelsRepository } from './repositories/models.repository';

@Module({
  imports: [],
  providers: [PrismaService, BrandsRepository, ModelsRepository],
  exports: [PrismaService, BrandsRepository, ModelsRepository],
})
export class PersistenceModule {}
