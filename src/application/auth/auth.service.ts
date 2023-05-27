import {
  BadRequestException,
  ConflictException,
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
      throw new ConflictException('Email ya registrado');
    }
    if (findUser && !findUser.hasConfirmedEmail) {
      throw new BadRequestException(
        'Por favor revisa tu correo, tu código de verificación ya ha sido enviado',
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
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña inválida');
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Contraseña inválida');
    }
    const payload = {
      username: user.email,
      sub: user.id,
      hasActiveNotifications: user.hasActiveNotifications,
    };
    await this.registerLastSession(user.id, userAgent);

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async resendEmailConfirmation(email: string): Promise<CreateAccountEntity> {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (!findUser) {
      throw new BadRequestException('Por favor crea una cuenta');
    }
    if (findUser?.hasConfirmedEmail) {
      throw new BadRequestException('Correo electrónico ya validado');
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
      message: `Tu código de verificación se envió exitosamente al correo: ${email}`,
      expirationTime,
    };
  }

  async confirmAccount(code: string): Promise<AccessTokenEntity> {
    const userWithValidCode = await this.userRepository.findUserByEmailCode(code);
    if (!userWithValidCode) {
      throw new ForbiddenException('Código inválido');
    }
    if (userWithValidCode.hasConfirmedEmail === true) {
      throw new BadRequestException('Correo ya confirmado');
    }

    const account = await this.userRepository.validateAccount(userWithValidCode.id);
    const payload = { username: account.email, sub: account.id };
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
