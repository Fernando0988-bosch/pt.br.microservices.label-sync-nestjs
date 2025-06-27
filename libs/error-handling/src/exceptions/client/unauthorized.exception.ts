import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class UnauthorizedException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.UNAUTHORIZED,
      message,
      details,
    });
  }
}

export class InvalidCredentialsException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.INVALID_CREDENTIALS,
      message,
    });
  }
}

export class TokenExpiredException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.TOKEN_EXPIRED,
      message,
    });
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.INVALID_TOKEN,
      message,
    });
  }
}
