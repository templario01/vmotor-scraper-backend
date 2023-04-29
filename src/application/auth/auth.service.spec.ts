import { Test, TestingModule } from '@nestjs/testing';
import {
  buildJwtServiceMock,
  buildMailerService,
} from '../../shared/test-utils/providers.mock';
import { AuthService } from './auth.service';
import { buildUserRepositoryMock } from '../../shared/test-utils/repositories.mock';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../persistence/repositories/user.repository';
import { MailerService } from '../mailer/mailer.service';
import {
  randAlphaNumeric,
  randEmail,
  randPassword,
  randPastDate,
  randUserAgent,
  randUuid,
} from '@ngneat/falso';
import {
  buildUserMock,
  buildValidationCodeMock,
} from '../../shared/mocks/prisma-types.mocks';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  const jwtServiceMock = buildJwtServiceMock();
  const userRepositoryMock = buildUserRepositoryMock();
  const mailerServiceMock = buildMailerService();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should return an CreateAccountEntity and send a validation code when is called with a new email', async () => {
      const input = { email: randEmail(), password: randPassword() };
      const userMock = buildUserMock({ email: input.email, hasConfirmedEmail: false });
      const validationCodeMock = buildValidationCodeMock();
      jest.spyOn(userRepositoryMock, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userRepositoryMock, 'createAccount').mockResolvedValue(userMock);
      jest
        .spyOn(userRepositoryMock, 'createValidationCode')
        .mockResolvedValue(validationCodeMock);

      const result = await service.signUp(input);

      expect(result).toMatchObject({
        expirationTime: expect.any(Date),
        message:
          `Please write your validation code send to ${input.email}. ` +
          "If you don't see the email, please check your spam folder. The validation code expires in 5 minutes",
      });
    });
  });

  describe('signIn', () => {
    it('should return an AccessTokenEntity when is called with a registered email', async () => {
      const input = { email: randEmail(), password: randPassword() };
      const userMock = buildUserMock({ email: input.email, hasConfirmedEmail: true });
      const tokenResponseMock = randAlphaNumeric({ length: 100 }).join('');
      jest.spyOn(userRepositoryMock, 'findUserByEmail').mockResolvedValue(userMock);
      jest.spyOn(userRepositoryMock, 'registerSession').mockResolvedValue({
        email: userMock.email,
        lastSession: randPastDate(),
        uuid: randUuid(),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(<never>true);
      jest.spyOn(jwtServiceMock, 'signAsync').mockResolvedValue(tokenResponseMock);
      const userAgentMock = randUserAgent();

      const result = await service.signIn(input, userAgentMock);

      expect(result).toMatchObject({
        accessToken: tokenResponseMock,
      });
    });
  });

  describe('confirmAccount', () => {
    it('should return an AccessTokenEntity when is called with valid code', async () => {
      const codeMock = 'F3GTXU';
      const userMock = buildUserMock({ hasConfirmedEmail: false });
      const tokenResponseMock = randAlphaNumeric({ length: 100 }).join('');
      jest.spyOn(jwtServiceMock, 'signAsync').mockResolvedValue(tokenResponseMock);
      jest.spyOn(userRepositoryMock, 'findUserByEmailCode').mockResolvedValue(userMock);
      jest
        .spyOn(userRepositoryMock, 'validateAccount')
        .mockResolvedValue({ ...userMock, hasConfirmedEmail: true });

      const result = await service.confirmAccount(codeMock);

      expect(result).toMatchObject({
        accessToken: tokenResponseMock,
      });
    });
  });
});
