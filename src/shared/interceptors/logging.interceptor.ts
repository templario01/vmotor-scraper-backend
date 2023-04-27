import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const now = Date.now();
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const userAgent = request.get('user-agent') || '';
      const { ip, method, path: url } = request;
      this.logger.verbose(`${method} ${url} ${userAgent} ${ip}`);
    } else {
      const { operation: resolverOperation, fieldName } = context.getArgs()[3];
      this.logger.verbose(
        `POST /${context.getType()} -> ${resolverOperation.operation}: ${fieldName}`,
      );
    }

    return next.handle().pipe(
      tap(() => {
        this.logger.verbose(`request finished on ${Date.now() - now}ms`);
      }),
    );
  }
}
