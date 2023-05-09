import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { BrandsRepository } from './repositories/brands.repository';
import { ModelsRepository } from './repositories/models.repository';
import { WebsiteRepository } from './repositories/website.repository';
import { VehicleRepository } from './repositories/vehicle.repository';
import { UserRepository } from './repositories/user.repository';
import { FavoriteVehicleRepository } from './repositories/favorite-vehicle.repository';
import { ProxyRepository } from './repositories/proxy.repository';
import { VehicleSearchRepository } from './repositories/vehicle-search.repository';

const repositories = [
  BrandsRepository,
  ModelsRepository,
  WebsiteRepository,
  VehicleRepository,
  UserRepository,
  FavoriteVehicleRepository,
  ProxyRepository,
  VehicleSearchRepository,
];
@Module({
  imports: [],
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class PersistenceModule {}
