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

@Resolver()
export class UserResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(createAccountReturnType)
  resendEmail(@Args('email') email: string): Promise<CreateAccountEntity> {
    return this.authService.resendEmailConfirmation(email);
  }

  @Mutation(accessTokenReturnType)
  verifyUser(@Args('code') code: string): Promise<AccessTokenEntity> {
    return this.authService.confirmAccount(code);
  }
}
