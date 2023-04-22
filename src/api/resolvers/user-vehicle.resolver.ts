import { Args, Context, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FavoriteVehicleService } from '../../application/favorite-vehicle/favorite-vehicle.service';
import { AddFavoriteVehicleInput } from '../../application/favorite-vehicle/inputs/add-favorite-vehicle.input';
import {
  SyncedVehicleEntity,
  arraySyncedVehicleEntityReturnType,
  syncedVehicleEntityReturnType,
} from '../../application/vehicles/entities/synced-vehicle.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../application/auth/guards/auth.guard';
import {
  WebsiteEntity,
  websiteEntityReturnType,
} from '../../application/websites/entities/website.entity';
import { WebsiteService } from '../../application/websites/website.service';
import { DeleteFavoriteVehicleInput } from '../../application/favorite-vehicle/inputs/delete-favorite-vehicle.input';

@Resolver(syncedVehicleEntityReturnType)
export class UserVehicleResolver {
  constructor(
    private readonly favoriteVehicleService: FavoriteVehicleService,
    private readonly websiteService: WebsiteService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(syncedVehicleEntityReturnType)
  addFavoriteVehicleToUser(
    @Args('addFavoriteVehicleInput') input: AddFavoriteVehicleInput,
    @Context() { req: { user } }: any,
  ): Promise<SyncedVehicleEntity> {
    return this.favoriteVehicleService.addFavoriteVehicleToUser(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Mutation(arraySyncedVehicleEntityReturnType)
  deleteFavoriteVehicleToUser(
    @Args('deleteFavoriteVehicleInput') input: DeleteFavoriteVehicleInput,
    @Context() { req: { user } }: any,
  ): Promise<SyncedVehicleEntity[]> {
    return this.favoriteVehicleService.deleteFavoriteVehicleToUser(input, user.sub);
  }

  @ResolveField(websiteEntityReturnType, { name: 'website' })
  website(@Parent() { websiteId }: SyncedVehicleEntity): Promise<WebsiteEntity> {
    return this.websiteService.getWebsite(websiteId);
  }
}
