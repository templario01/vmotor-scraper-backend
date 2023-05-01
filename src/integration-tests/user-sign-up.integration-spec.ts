import { UserFactory } from './factories/user.factory';
import { doRequestToGraphqlServer } from './test-utils/integration-tests.utils';
import { buildSignUpMutation } from './test-utils/stubs';
import { randEmail, randPassword } from '@ngneat/falso';

describe('User SignUp', () => {
  let userFactory: UserFactory;

  beforeAll(async () => {
    userFactory = new UserFactory(global.prisma);
  });

  describe('Happy Path', () => {
    it('should return status 200 and CreateAccountEntity when is a new correct email', async () => {
      const input = { email: randEmail(), password: randPassword() };
      const gqlRequestBody = buildSignUpMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          signUp: {
            expirationTime: expect.any(String),
            message:
              `Please write your validation code send to ${input.email}. ` +
              `If you don't see the email, please check your spam folder. The validation code expires in 5 minutes`,
          },
        },
      });
    });
  });

  describe('Sad Path', () => {
    it('should return status 400 and Bad Request Exception when the email is invalid', async () => {
      const input = { email: 'fake-email.com', password: randPassword() };
      const gqlRequestBody = buildSignUpMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(400);
      expect(response.body).toMatchObject({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              response: {
                error: 'Bad Request',
                message: ['email must be an email'],
                statusCode: 400,
              },
            },
            message: 'Bad Request Exception',
          },
        ],
      });
    });

    it('should return status 400 and Bad Request Exception when the accound need validation', async () => {
      const userOne = await userFactory.make({ hasConfirmedEmail: false });
      const input = { email: userOne.email, password: randPassword() };
      const gqlRequestBody = buildSignUpMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(400);
      expect(response.body).toMatchObject({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              response: {
                error: 'Bad Request',
                message:
                  'please check your email, the verification code was already sent',
                statusCode: 400,
              },
            },
            message: 'please check your email, the verification code was already sent',
          },
        ],
      });
    });

    it('should return status 400 and Confict Exception when the email has been already used', async () => {
      const userOne = await userFactory.make({ hasConfirmedEmail: true });
      const input = { email: userOne.email, password: randPassword() };
      const gqlRequestBody = buildSignUpMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(400);
      expect(response.body).toMatchObject({
        data: null,
        errors: [
          {
            extensions: {
              code: '409',
              response: {
                error: 'Conflict',
                message: 'email already taken',
                statusCode: 409,
              },
            },
            message: 'email already taken',
          },
        ],
      });
    });
  });
});
