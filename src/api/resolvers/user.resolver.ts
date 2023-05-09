import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../application/auth/auth.service';
import {
  CreateAccountEntity,
  createAccountReturnType,
} from '../../application/auth/entities/create-account.entity';
import {
  AccessTokenEntity,
  accessTokenReturnType,
} from '../../application/auth/entities/access-token.entity';
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
  PaginatedUserSearchesEntity,
  paginatedUserSearchesEntityReturnType,
} from '../../application/user/entities/user-search.entity';
import { UserSearchService } from '../../application/user/services/user-search.service';
import { GetSearchesArgs } from '../../application/user/inputs/get-searches.input';
import { PaginatedVehicleEntity } from '../../application/vehicles/entities/synced-vehicle.entity';
import { GetRecommendedVehiclesArgs } from '../../application/user/inputs/get-recommended-vehicles.input';

@Resolver()
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userSearchService: UserSearchService,
  ) {}

  @Mutation(createAccountReturnType)
  resendEmail(@Args('email') email: string): Promise<CreateAccountEntity> {
    return this.authService.resendEmailConfirmation(email);
  }

  @Mutation(accessTokenReturnType)
  verifyUser(@Args('code') code: string): Promise<AccessTokenEntity> {
    return this.authService.confirmAccount(code);
  }

  @UseGuards(AuthGuard)
  @Mutation(toggleUserNotificationsReturnType)
  toggleUserNotifications(
    @Args('hasActiveNotifications') hasActiveNotifications: boolean,
    @CurrentUser() user: SessionData,
  ): Promise<ToggleUserNotificationsEntity> {
    return this.userService.toggleUserNotifications(user.sub, hasActiveNotifications);
  }

  @UseGuards(AuthGuard)
  @Query(paginatedUserSearchesEntityReturnType)
  getSearchHistory(
    @Args() args: GetSearchesArgs,
    @CurrentUser() user: SessionData,
  ): Promise<PaginatedUserSearchesEntity> {
    return this.userSearchService.getSearchHistory(args, user.sub);
  }

  @Query(() => PaginatedVehicleEntity)
  @UseGuards(AuthGuard)
  getRecommendedVehicles(
    @CurrentUser() user: SessionData,
    @Args() args: GetRecommendedVehiclesArgs,
  ): Promise<PaginatedVehicleEntity> {
    return this.userSearchService.getRecommendedVehicles(args, user.sub);
  }
}
