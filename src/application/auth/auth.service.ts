import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { SignInInput } from './inputs/sign-in.input';
import { MailerService } from '../mailer/mailer.service';
import { CreateAccountEntity } from './entities/create-account.entity';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenEntity } from './entities/access-token.entity';
import { compare } from 'bcrypt';
import { SignUpInput } from './inputs/sign-up.input';
import { NotifyEmailDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp({ email, password }: SignUpInput): Promise<CreateAccountEntity> {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (findUser?.hasConfirmedEmail) {
      throw new BadRequestException('email already taken');
    }
    if (findUser && !findUser.hasConfirmedEmail) {
      throw new BadRequestException(
        'please check your email, the verification code was already sent',
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
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('invalid password');
    }
    const payload = { username: user.email, sub: user.id };
    await this.registerLastSession(user.id, userAgent);

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async resendEmailConfirmation(email: string): Promise<CreateAccountEntity> {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (!findUser) {
      throw new BadRequestException('please create an account');
    }
    if (findUser?.hasConfirmedEmail) {
      throw new BadRequestException('email already validated');
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

  async confirmAccount(code: string): Promise<AccessTokenEntity> {
    const userWithValidCode = await this.userRepository.findUserByEmailCode(code);
    if (!userWithValidCode) {
      throw new ForbiddenException('Invalid code');
    }
    if (userWithValidCode.hasConfirmedEmail === true) {
      throw new BadRequestException('Email already confirmed');
    }

    const account = await this.userRepository.validateAccount(userWithValidCode.id);
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
