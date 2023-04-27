import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../application/auth/auth.service';
import {
  CreateAccountEntity,
  createAccountReturnType,
} from '../../application/auth/entities/create-account.entity';
import { VerifyUserInput } from '../../application/user/inputs/verify-user.input';
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
  verifyUser(
    @Args('verifyUserInput') input: VerifyUserInput,
  ): Promise<AccessTokenEntity> {
    return this.authService.confirmAccount(input);
  }
}
