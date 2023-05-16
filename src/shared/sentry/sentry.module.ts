import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor } from 'nest-raven';
import * as Sentry from '@sentry/node';
import { SentryErrorInterceptor } from './interceptors/sentry-error.interceptor';
import { SentryService } from './sentry.service';

export const SENTRY_OPTIONS = 'SENTRY_OPTIONS';

@Module({
  providers: [SentryService],
})
export class SentryModule {
  static forRoot(options: Sentry.NodeOptions) {
    Sentry.init(options);

    return {
      module: SentryModule,
      providers: [
        SentryService,
        {
          provide: APP_INTERCEPTOR,
          useClass: SentryErrorInterceptor,
        },
        {
          provide: APP_INTERCEPTOR,
          useValue: new RavenInterceptor(),
        },
      ],
      exports: [SentryService],
    };
  }
}
