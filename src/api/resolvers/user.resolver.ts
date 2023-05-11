import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
  UserSearchEntity,
  userSearchesEntityReturnType,
} from '../../application/user/entities/user-search.entity';
import { UserSearchService } from '../../application/user/services/user-search.service';
import { DeleteSearchInput } from '../../application/user/inputs/delete-search.input';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userSearchService: UserSearchService,
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
  @Query(userSearchesEntityReturnType)
  getSearchHistory(@CurrentUser() user: SessionData): Promise<UserSearchEntity[]> {
    return this.userSearchService.getSearchHistory(user.sub);
  }

  @UseGuards(AuthGuard)
  @Mutation(userSearchesEntityReturnType)
  deleteSearch(
    @Args('deleteSearchInput') input: DeleteSearchInput,
    @CurrentUser() user: SessionData,
  ): Promise<UserSearchEntity[]> {
    return this.userSearchService.deleteSearch(input, user.sub);
  }
}
