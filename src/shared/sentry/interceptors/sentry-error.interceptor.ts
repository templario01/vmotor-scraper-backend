import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SentryService } from '../sentry.service';

@Injectable({ scope: Scope.REQUEST })
export class SentryErrorInterceptor implements NestInterceptor {
  constructor(private sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const interceptor = next.handle().pipe(
      catchError((error) => {
        Sentry.captureException(error, this.sentryService.span.getTraceContext());

        throw error;
      }),
      finalize(() => {
        this.sentryService.span.finish();
      }),
    );

    return interceptor;
  }
}
