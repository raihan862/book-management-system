import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const body = request.body as Record<string, unknown> | undefined;
    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`);

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${responseTime}ms`,
          );
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - now;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error Response: ${method} ${url} - ${responseTime}ms - ${errorMessage}`,
          );
        },
      }),
    );
  }
}
