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
  constructor(private logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.getArgByIndex(0);
    const { method, url } = request;

    const start = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - start;
        const response = context.getArgByIndex(1);

        this.logger.log(
          `${method} ${url} - ${response.statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
