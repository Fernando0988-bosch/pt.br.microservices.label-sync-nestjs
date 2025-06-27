import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class TimeoutException extends BaseException {
  constructor(service: string, timeoutMs: number) {
    super({
      errorCode: ErrorCode.TIMEOUT_ERROR,
      message: `Timeout ao conectar com ${service} após ${timeoutMs}ms`,
      details: { service, timeoutMs },
      retryable: true,
    });
  }
}

export class GatewayTimeoutException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.GATEWAY_TIMEOUT,
      message,
      details,
      retryable: true,
    });
  }
}
