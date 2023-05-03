import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../application/auth/auth.service';
import {
  CreateAccountEntity,
  createAccountReturnType,
} from '../../application/auth/entities/create-account.entity';
import {
  AccessTokenEntity,
  accessTokenReturnType,
} from '../../application/auth/entities/access-token.entity';
import { UserService } from '../../application/user/user.service';
import {
  ToggleUserNotificationsEntity,
  toggleUserNotificationsReturnType,
} from '../../application/user/entities/toggle-user-notifications.entity';
import { CurrentUser } from '../../shared/decorators/context.decorator';
import { SessionData } from '../../application/auth/dtos/auth.dto';
import { AuthGuard } from '../../application/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
}
