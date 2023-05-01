import { encryptPassword } from '../shared/utils/user.utils';
import { UserFactory } from './factories/user.factory';
import { doRequestToGraphqlServer } from './test-utils/integration-tests.utils';
import { buildSignInMutation } from './test-utils/stubs';
import { randEmail, randPassword } from '@ngneat/falso';

describe('User SignIn', () => {
  let userFactory: UserFactory;

  beforeAll(async () => {
    userFactory = new UserFactory(global.prisma);
  });

  describe('Happy Path', () => {
    it('should return status 200 and AccessTokenEntity when the input is correct', async () => {
      const input = { email: randEmail(), password: randPassword() };
      const encriptedPassword = await encryptPassword(input.password);
      await userFactory.make({
        email: input.email,
        password: encriptedPassword,
        hasConfirmedEmail: true,
      });

      const gqlRequestBody = buildSignInMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          signIn: {
            accessToken: expect.any(String),
          },
        },
      });
    });
  });

  describe('Sad Path', () => {
    it('should return status 400 and Bad Request Exception when the email is invalid', async () => {
      const input = { email: 'fake-email.com', password: randPassword() };
      const gqlRequestBody = buildSignInMutation(input);

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

    it('should return status 400 and Unauthorized Exception when the password is wrong', async () => {
      const userOne = await userFactory.make({
        hasConfirmedEmail: true,
      });
      const input = { email: userOne.email, password: randPassword() };
      const gqlRequestBody = buildSignInMutation(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(400);
      expect(response.body).toMatchObject({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              response: {
                error: 'Unauthorized',
                message: 'invalid password',
                statusCode: 401,
              },
            },
            message: 'invalid password',
          },
        ],
      });
    });
  });
});
