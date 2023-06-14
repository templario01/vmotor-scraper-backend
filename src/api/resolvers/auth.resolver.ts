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
import { SignUpInput } from '../../application/auth/inputs/sign-up.input';
import { SignInInput } from '../../application/auth/inputs/sign-in.input';
import { UserAgent } from '../../shared/decorators/context.decorator';

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
    @UserAgent() userAgent: string,
  ): Promise<AccessTokenEntity> {
    return this.authService.signIn(input, userAgent);
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
