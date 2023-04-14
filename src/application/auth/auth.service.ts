import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { CreateAccountInput } from './inputs/create-account.input';
import { MailerService } from '../mailer/mailer.service';
import { CreateAccountEntity } from './entities/create-account.entity';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenEntity } from './entities/access-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
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
    const { email: registeredEmail, uuid } = await this.userRepository.createAccount({
      email,
      password,
    });

    return this.notifyEmail(registeredEmail, uuid);
  }

  async resendEmailConfirmation(email: string) {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (!findUser) {
      throw new HttpException('please create an account', HttpStatus.BAD_REQUEST);
    }
    if (findUser?.hasConfirmedEmail) {
      throw new HttpException('email already validated', HttpStatus.BAD_REQUEST);
    }

    return this.notifyEmail(email, findUser.uuid);
  }

  private async notifyEmail(email: string, userUUID: string) {
    const { appHost } = this.envConfigService.app();
    await this.mailerService.sendEmailConfirmation({ email, host: appHost, userUUID });

    return {
      message: `Please confirm your email ${email}. If you don't see the confirmation email in your inbox, please check your spam folder.`,
    };
  }

  async confirmAccount(userUUID: string): Promise<AccessTokenEntity> {
    const user = await this.userRepository.validateAccount(userUUID);
    const payload = { username: user.email, sub: user.uuid };
    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.envConfigService.jwtConfig().expirationTime;

    return {
      accessToken,
      expiresIn,
    };
  }
}
