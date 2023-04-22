import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { SignInInput } from './inputs/sign-in.input';
import { MailerService } from '../mailer/mailer.service';
import { CreateAccountEntity } from './entities/create-account.entity';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenEntity } from './entities/access-token.entity';
import { compare } from 'bcrypt';
import { SignUpInput } from './inputs/sign-up.input';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp({ email, password }: SignUpInput): Promise<CreateAccountEntity> {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (findUser?.hasConfirmedEmail) {
      throw new HttpException('email already taken', HttpStatus.BAD_REQUEST);
    }
    if (findUser && !findUser.hasConfirmedEmail) {
      throw new HttpException('please confirm your email', HttpStatus.BAD_REQUEST);
    }
    const { email: registeredEmail, id } = await this.userRepository.createAccount({
      email,
      password,
    });

    return this.notifyEmail(registeredEmail, id);
  }

  async signIn(
    { email, password }: SignInInput,
    userAgent: string,
  ): Promise<AccessTokenEntity> {
    const user = await this.userRepository.findUserByEmail(email);
    const isValidPassword = compare(password, user.password);
    if (!isValidPassword) {
      throw new HttpException('invalid password', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: user.email, sub: user.id };
    await this.registerLastSession(user.id, userAgent);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.envConfigService.jwtConfig().expirationTime,
    };
  }

  async resendEmailConfirmation(email: string) {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (!findUser) {
      throw new HttpException('please create an account', HttpStatus.BAD_REQUEST);
    }
    if (findUser?.hasConfirmedEmail) {
      throw new HttpException('email already validated', HttpStatus.BAD_REQUEST);
    }

    return this.notifyEmail(email, findUser.id);
  }

  private async notifyEmail(email: string, userId: number) {
    const { appHost } = this.envConfigService.app();
    await this.mailerService.sendEmailConfirmation({ email, host: appHost, userId });

    return {
      message: `Please confirm your email ${email}. If you don't see the confirmation email in your inbox, please check your spam folder.`,
    };
  }

  async confirmAccount(userId: number): Promise<AccessTokenEntity> {
    const { hasConfirmedEmail } = await this.userRepository.findUserById(userId);
    if (hasConfirmedEmail === true) {
      return null;
    }
    const user = await this.userRepository.validateAccount(userId);
    const payload = { username: user.email, sub: user.uuid };
    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.envConfigService.jwtConfig().expirationTime;

    return {
      accessToken,
      expiresIn,
    };
  }

  private async registerLastSession(userId: number, userAgent: string): Promise<void> {
    const user = await this.userRepository.registerSession(userId);

    this.logger.verbose(
      `New session registered: ${JSON.stringify({ ...user, userAgent })}`,
    );
  }
}
