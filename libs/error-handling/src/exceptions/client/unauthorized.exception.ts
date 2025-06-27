import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class UnauthorizedException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.UNAUTHORIZED,
      ...(message && { message }),
      ...(details !== undefined && { details }),
    });
  }
}

export class InvalidCredentialsException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.INVALID_CREDENTIALS,
      ...(message && { message }),
    });
  }
}

export class TokenExpiredException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.TOKEN_EXPIRED,
      ...(message && { message }),
    });
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message?: string) {
    super({
      errorCode: ErrorCode.INVALID_TOKEN,
      ...(message && { message }),
    });
  }
}
