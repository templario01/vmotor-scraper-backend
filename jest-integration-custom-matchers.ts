import { expect } from '@jest/globals';
import MatcherContext = jest.MatcherContext;
import request from 'supertest';

const toBeCacheable = function (this: MatcherContext, received: request.Response) {
  if (received.headers['cache-control'] == 'max-age=0, private') {
    return {
      pass: false,
      message: () => `It is not cached`,
    };
  }
  if (received.headers['cache-control']) {
    return {
      pass: true,
      message: () => `It is Cached`,
    };
  }
  return {
    pass: false,
    message: () => `It is not cached`,
  };
};

expect.extend({ toBeCacheable });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeCacheable(): R;
    }
  }
}
