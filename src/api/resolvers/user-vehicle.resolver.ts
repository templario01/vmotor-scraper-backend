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
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';

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
    @CurrentUser() user: SessionData,
  ): Promise<SyncedVehicleEntity> {
    return this.favoriteVehicleService.addFavoriteVehicleToUser(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Mutation(arraySyncedVehicleEntityReturnType)
  deleteFavoriteVehicleToUser(
    @Args('deleteFavoriteVehicleInput') input: DeleteFavoriteVehicleInput,
    @CurrentUser() user: SessionData,
  ): Promise<SyncedVehicleEntity[]> {
    return this.favoriteVehicleService.deleteFavoriteVehicleToUser(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Query(arraySyncedVehicleEntityReturnType)
  getFavoriteVehicles(@CurrentUser() user: SessionData) {
    return this.favoriteVehicleService.getAllFavoriteVehicles(user.sub);
  }

  @ResolveField(websiteEntityReturnType, { name: 'website' })
  website(@Parent() { websiteId }: SyncedVehicleEntity): Promise<WebsiteEntity> {
    return this.websiteService.getWebsite(websiteId);
  }
}
