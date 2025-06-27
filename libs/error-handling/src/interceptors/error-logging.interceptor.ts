import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId = this.ensureCorrelationId(request);
    const startTime = Date.now();

    const { method, url } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log({
          message: 'Request completed successfully',
          correlationId,
          method,
          url,
          statusCode,
          responseTime,
          controller: className,
          handler: handlerName,
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;

        this.logger.error({
          message: 'Request failed',
          correlationId,
          method,
          url,
          responseTime,
          controller: className,
          handler: handlerName,
          error: {
            name: error.name,
            message: error.message,
            errorCode: error.errorCode,
            stack: error.stack,
          },
        });

        return throwError(() => error);
      }),
    );
  }

  private ensureCorrelationId(request: Request): string {
    let correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string);

    if (!correlationId) {
      correlationId = this.generateCorrelationId();
      request.headers['x-correlation-id'] = correlationId;
    }

    return correlationId;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
