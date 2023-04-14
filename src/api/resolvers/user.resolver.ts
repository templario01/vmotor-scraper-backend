import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateAccountInput } from '../../application/auth/inputs/create-account.input';
import { AuthService } from '../../application/auth/auth.service';
import {
  CreateAccountEntity,
  createAccountReturnType,
} from '../../application/auth/entities/create-account.entity';

@Resolver()
export class UserResolver {
  constructor(private readonly authService: AuthService) {
    null;
  }

  @Mutation(createAccountReturnType)
  createAccount(
    @Args('createAccountInput') input: CreateAccountInput,
  ): Promise<CreateAccountEntity> {
    return this.authService.createAccount(input);
  }
}
