import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { CreateAccountInput } from './inputs/create-account.input';
import { MailerService } from '../mailer/mailer.service';
import { CreateAccountEntity } from './entities/create-account.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
  ) {}

  async createAccount({
    email,
    password,
  }: CreateAccountInput): Promise<CreateAccountEntity> {
    const findUser = await this.userRepository.findUserByEmail(email);

    if (findUser?.hasConfirmedEmail) {
      throw new HttpException('email already taken', HttpStatus.BAD_REQUEST);
    }
    if (findUser && !findUser.hasConfirmedEmail) {
      throw new HttpException('please confirm your email', HttpStatus.BAD_REQUEST);
    }

    const { email: registeredEmail } = await this.userRepository.createAccount({
      email,
      password,
    });
    this.mailerService.sendEmailConfirmation(registeredEmail);

    return {
      message: `Please confirm your email: ${registeredEmail}. If you don't see the confirmation email in your inbox, please check your spam folder.`,
    };
  }
}
