import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessages, HttpStatusByErrorCode } from '../../constants';
import { ExceptionMetadata } from '../../interfaces';
import { ErrorContext } from '../../interfaces/error-response.interface';

export abstract class BaseException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;
  public readonly context?: ErrorContext;
  public override readonly cause: Error | undefined;
  public readonly retryable: boolean;
  public readonly timestamp: string;
  public readonly correlationId?: string;

  constructor(metadata: ExceptionMetadata) {
    const statusCode = HttpStatusByErrorCode[metadata.errorCode] ?? HttpStatus.BAD_GATEWAY;
    const message = metadata.message ?? ErrorMessages[metadata.errorCode];

    const response = {
      statusCode,
      errorCode: metadata.errorCode,
      message: metadata.userMessage ?? message,
      details: metadata.details,
      timestamp: new Date().toISOString(),
    };

    super(response, statusCode, { cause: metadata.cause });

    this.errorCode = metadata.errorCode;
    if (metadata.details !== undefined) {
      this.details = metadata.details;
    }
    if (metadata.context !== undefined) {
      this.context = metadata.context;
    }
    this.cause = metadata.cause;
    this.retryable = metadata.retryable ?? false;
    this.timestamp = new Date().toISOString();
    if (metadata.context?.correlationId !== undefined) {
      this.correlationId = metadata.context.correlationId;
    }

    if (metadata.cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${metadata.cause.stack}`;
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      statusCode: this.getStatus(),
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
      correlationId: this.correlationId,
    };
  }

  isRetryable(): boolean {
    return this.retryable;
  }

  withContext(context: Record<string, unknown>): this {
    (this as unknown as { context?: ErrorContext }).context = { ...this.context, ...context };
    return this;
  }
}
