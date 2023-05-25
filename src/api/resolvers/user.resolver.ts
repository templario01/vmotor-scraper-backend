import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  ToggleUserNotificationsEntity,
  toggleUserNotificationsReturnType,
} from '../../application/user/entities/toggle-user-notifications.entity';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';
import { AuthGuard } from '../../application/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../../application/user/services/user.service';
import {
  PaginatedUserSearchEntity,
  UserSearchEntity,
  typeofArrayUserSearcheEntity,
  typeofPaginatedUserSearchesEntity,
} from '../../application/user/entities/user-search.entity';
import { UserSearchService } from '../../application/user/services/user-search.service';
import { DeleteSearchInput } from '../../application/user/inputs/delete-search.input';
import {
  UserEntity,
  typeofUserEntity,
} from '../../application/user/entities/user.entity';
import { GetUserSearchArgs } from '../../application/user/inputs/get-searches.input';
import { typeofPaginatedVehicleEntity } from '../../application/vehicles/entities/synced-vehicle.entity';
import { UserFavoriteVehicleService } from '../../application/user/services/user-favorite-vehicle.service';

@Resolver(typeofUserEntity)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userSearchService: UserSearchService,
    private readonly userFavoriteVehicleService: UserFavoriteVehicleService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(toggleUserNotificationsReturnType)
  toggleUserNotifications(
    @Args('hasActiveNotifications') hasActiveNotifications: boolean,
    @CurrentUser() user: SessionData,
  ): Promise<ToggleUserNotificationsEntity> {
    return this.userService.toggleUserNotifications(user.sub, hasActiveNotifications);
  }

  @UseGuards(AuthGuard)
  @Query(typeofPaginatedUserSearchesEntity)
  getSearchHistory(
    @CurrentUser() user: SessionData,
    @Args() args: GetUserSearchArgs,
  ): Promise<PaginatedUserSearchEntity> {
    return this.userSearchService.getSearchHistory(user.sub, args);
  }

  @UseGuards(AuthGuard)
  @Mutation(typeofArrayUserSearcheEntity)
  deleteSearch(
    @Args('deleteSearchInput') input: DeleteSearchInput,
    @CurrentUser() user: SessionData,
  ): Promise<UserSearchEntity[]> {
    return this.userSearchService.deleteSearch(input, user.sub);
  }

  @UseGuards(AuthGuard)
  @Query(typeofUserEntity)
  getUserInfo(@CurrentUser() user: SessionData): Promise<UserEntity> {
    return this.userService.getUserInfo(user.sub);
  }

  @ResolveField(typeofPaginatedUserSearchesEntity)
  searches(
    @Parent() { id }: UserEntity,
    @Args() args: GetUserSearchArgs,
  ): Promise<PaginatedUserSearchEntity> {
    return this.userSearchService.getSearchHistory(id, args);
  }

  @ResolveField(typeofPaginatedVehicleEntity)
  favoriteVehicles(
    @Parent() { id }: UserEntity,
    @Args() args: GetUserSearchArgs,
  ): Promise<PaginatedUserSearchEntity> {
    return this.userFavoriteVehicleService.getAllFavoriteVehicles(id, args);
  }
}
