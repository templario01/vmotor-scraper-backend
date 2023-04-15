import { InputType } from '@nestjs/graphql';

import { SignUpInput } from './sign-up.input';

@InputType()
export class SignInInput extends SignUpInput {}
