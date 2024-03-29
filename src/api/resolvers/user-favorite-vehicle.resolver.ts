import { UserFavoriteVehicleService } from '../../application/user/services/user-favorite-vehicle.service';
import { AddFavoriteVehicleInput } from '../../application/user/inputs/add-favorite-vehicle.input';
import {
  PaginatedVehicleEntity,
  SyncedVehicleEntity,
  arraySyncedVehicleEntityReturnType,
  syncedVehicleEntityReturnType,
  typeofPaginatedVehicleEntity,
} from '../../application/vehicles/entities/synced-vehicle.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../application/auth/guards/auth.guard';
import {
  WebsiteEntity,
  websiteEntityReturnType,
} from '../../application/websites/entities/website.entity';
import { WebsiteService } from '../../application/websites/website.service';
import { DeleteFavoriteVehicleInput } from '../../application/user/inputs/delete-favorite-vehicle.input';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';
import { GetFavoriteVehiclesArgs } from '../../application/user/inputs/get-searches.input';

@Resolver(syncedVehicleEntityReturnType)
export class UserFavoriteVehicleResolver {
  constructor(
    private readonly userFavoriteVehicleService: UserFavoriteVehicleService,
    private readonly websiteService: WebsiteService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(arraySyncedVehicleEntityReturnType)
  addFavoriteVehicleToUser(
    @Args('addFavoriteVehicleInput') input: AddFavoriteVehicleInput,
    @CurrentUser() user: SessionData,
  ): Promise<SyncedVehicleEntity[]> {
    return this.userFavoriteVehicleService.addFavoriteVehicleToUser(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Mutation(arraySyncedVehicleEntityReturnType)
  deleteFavoriteVehicleToUser(
    @Args('deleteFavoriteVehicleInput') input: DeleteFavoriteVehicleInput,
    @CurrentUser() user: SessionData,
  ): Promise<SyncedVehicleEntity[]> {
    return this.userFavoriteVehicleService.deleteFavoriteVehicleToUser(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Query(typeofPaginatedVehicleEntity)
  getFavoriteVehicles(
    @CurrentUser() user: SessionData,
    @Args() args: GetFavoriteVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.userFavoriteVehicleService.getAllFavoriteVehicles(user.sub, args);
  }

  @ResolveField(websiteEntityReturnType, { name: 'website' })
  website(@Parent() { websiteId }: SyncedVehicleEntity): Promise<WebsiteEntity> {
    return this.websiteService.getWebsite(websiteId);
  }
}
