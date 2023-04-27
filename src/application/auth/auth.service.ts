import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { SignInInput } from './inputs/sign-in.input';
import { MailerService } from '../mailer/mailer.service';
import { CreateAccountEntity } from './entities/create-account.entity';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenEntity } from './entities/access-token.entity';
import { compare } from 'bcrypt';
import { SignUpInput } from './inputs/sign-up.input';
import { NotifyEmailDto } from './dtos/auth.dto';
import { VerifyUserInput } from '../user/inputs/verify-user.input';

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
      throw new HttpException(
        'please check your email, the verification code was already sent',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.createAccount(email, password);
  }

  private async createAccount(email: string, password: string) {
    const { email: registeredEmail, id } = await this.userRepository.createAccount({
      email,
      password,
    });
    const { code, expirationTime } = await this.userRepository.createValidationCode(id);

    return this.notifyEmail({ email: registeredEmail, code, expirationTime });
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

    const { code, expirationTime } = await this.userRepository.createValidationCode(
      findUser.id,
    );
    return this.notifyEmail({ email, code, expirationTime });
  }

  private async notifyEmail(data: NotifyEmailDto): Promise<CreateAccountEntity> {
    const { code, email, expirationTime } = data;
    await this.mailerService.sendEmailConfirmation(email, code);

    return {
      message:
        `Please write your validation code send to ${email}. If you don't see the email,` +
        ` please check your spam folder. The validation code expires in 5 minutes`,
      expirationTime,
    };
  }

  async confirmAccount(input: VerifyUserInput): Promise<AccessTokenEntity> {
    const { code, email } = input;
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ForbiddenException('Please register your email first');
    }
    if (user.hasConfirmedEmail === true) {
      throw new BadRequestException('Email already confirmed');
    }
    const currentTime = new Date().getTime();
    const lastCode = await this.userRepository.findLastValidationCode(user.id);

    if (!lastCode) {
      throw new ForbiddenException('please resend a new validation code');
    }
    if (currentTime > lastCode.expirationTime.getTime()) {
      throw new ForbiddenException(
        'Your validation code has already expired, please send a new one',
      );
    }
    if (code !== lastCode.code) {
      throw new ForbiddenException('Invalid validation code');
    }

    const account = await this.userRepository.validateAccount(user.id);
    const payload = { username: account.email, sub: account.uuid };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  private async registerLastSession(userId: number, userAgent: string): Promise<void> {
    const user = await this.userRepository.registerSession(userId);

    this.logger.verbose(
      `New session registered: ${JSON.stringify({ ...user, userAgent })}`,
    );
  }
}
