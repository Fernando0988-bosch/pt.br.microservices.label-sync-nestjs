import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base';
import { ErrorResponse } from '../interfaces';
import { ErrorCode } from '../constants';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    this.logError(exception, errorResponse, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const correlationId = this.getCorrelationId(request);
    const baseResponse = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
    };

    if (exception instanceof BaseException) {
      return {
        ...baseResponse,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return {
        ...baseResponse,
        statusCode: status,
        errorCode: this.mapStatusToErrorCode(status),
        message:
          typeof response === 'string'
            ? response
            : ((response as Record<string, unknown>)?.['message'] ?? exception.message) as string,
        details:
          typeof response === 'object' ? (response as Record<string, unknown>)?.['details'] : undefined,
      };
    }

    // NUNCA retorna 500 - sempre converte para 502
    if (exception instanceof Error) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_GATEWAY,
        errorCode: ErrorCode.EXTERNAL_SERVICE_ERROR,
        message:
          process.env['NODE_ENV'] === 'production'
            ? 'Erro de comunicação com serviço externo'
            : exception.message,
        details: process.env['NODE_ENV'] === 'production' ? undefined : { stack: exception.stack },
      };
    }

    // NUNCA retorna 500 - sempre converte para 502
    return {
      ...baseResponse,
      statusCode: HttpStatus.BAD_GATEWAY,
      errorCode: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: 'Erro de comunicação com serviço externo',
    };
  }

  private getCorrelationId(request: Request): string {
    return (
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string) ||
      this.generateCorrelationId()
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    const statusMap: Record<number, ErrorCode> = {
      400: ErrorCode.BAD_REQUEST,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      405: ErrorCode.METHOD_NOT_ALLOWED,
      409: ErrorCode.CONFLICT,
      422: ErrorCode.UNPROCESSABLE_ENTITY,
      429: ErrorCode.TOO_MANY_REQUESTS,
      502: ErrorCode.EXTERNAL_SERVICE_ERROR,
      503: ErrorCode.SERVICE_UNAVAILABLE,
      504: ErrorCode.GATEWAY_TIMEOUT,
    };

    return statusMap[status] ?? ErrorCode.EXTERNAL_SERVICE_ERROR;
  }

  private logError(exception: unknown, errorResponse: ErrorResponse, request: Request): void {
    const sanitizedHeaders = this.sanitizeHeaders(request.headers);

    const logContext = {
      ...errorResponse,
      requestId: errorResponse.correlationId,
      stack: exception instanceof Error ? exception.stack : undefined,
      request: {
        body: this.sanitizeBody(request.body),
        query: request.query,
        params: request.params,
        headers: sanitizedHeaders,
        ip: request.ip,
        userAgent: request.get('user-agent'),
      },
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error('Server Error', logContext);
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn('Client Error', logContext);
    }
  }

  private sanitizeHeaders(headers: unknown): unknown {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...(headers as Record<string, unknown>) };

    sensitiveHeaders.forEach((header) => {
      if ((sanitized as Record<string, unknown>)[header]) {
        (sanitized as Record<string, unknown>)[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if ((sanitized as Record<string, unknown>)[field]) {
        (sanitized as Record<string, unknown>)[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
