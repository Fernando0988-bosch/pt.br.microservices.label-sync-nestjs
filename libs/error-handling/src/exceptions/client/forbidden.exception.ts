import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class ForbiddenException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.FORBIDDEN,
      message,
      details,
    });
  }
}

export class InsufficientPermissionsException extends BaseException {
  constructor(requiredPermissions?: string[], message?: string) {
    super({
      errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
      message,
      details: { requiredPermissions },
    });
  }
}
