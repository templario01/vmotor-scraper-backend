import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../application/auth/auth.service';
import {
  CreateAccountEntity,
  createAccountReturnType,
} from '../../application/auth/entities/create-account.entity';
import {
  AccessTokenEntity,
  accessTokenReturnType,
} from '../../application/auth/entities/access-token.entity';
import { SignUpInput } from '../../application/auth/inputs/sign-up.input';
import { SignInInput } from '../../application/auth/inputs/sign-in.input';
import { getUserAgentFromHeaders } from '../../shared/utils/auth.utils';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(createAccountReturnType)
  signUp(@Args('signUpInput') input: SignUpInput): Promise<CreateAccountEntity> {
    return this.authService.signUp(input);
  }

  @Mutation(accessTokenReturnType)
  signIn(
    @Args('signInInput') input: SignInInput,
    @Context() context: any,
  ): Promise<AccessTokenEntity> {
    return this.authService.signIn(input, getUserAgentFromHeaders(context));
  }

  @Mutation(createAccountReturnType)
  resendEmail(@Args('email') email: string): Promise<CreateAccountEntity> {
    return this.authService.resendEmailConfirmation(email);
  }

  @Mutation(accessTokenReturnType)
  verifyUser(@Args('code') code: string): Promise<AccessTokenEntity> {
    return this.authService.confirmAccount(code);
  }
}
