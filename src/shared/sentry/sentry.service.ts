import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as Sentry from '@sentry/node';
import { Span, SpanContext } from '@sentry/types';
import * as SentryTracing from '@sentry/tracing';
SentryTracing.addExtensionMethods();

@Injectable({ scope: Scope.REQUEST })
export class SentryService {
  constructor(@Inject(REQUEST) private request: Request) {
    const { method, headers, url } = this.request;
    const transaction = Sentry.startTransaction({
      name: `Route: ${method} ${url}`,
      op: 'transaction',
    });

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
      scope.setContext('http', {
        method,
        url,
        headers,
      });
    });
  }

  startChild(spanContext: SpanContext) {
    return this.span.startChild(spanContext);
  }

  get span(): Span {
    return Sentry.getCurrentHub().getScope().getSpan();
  }
}
