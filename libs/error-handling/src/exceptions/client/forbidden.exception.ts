import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class ForbiddenException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.FORBIDDEN,
      ...(message && { message }),
      ...(details !== undefined && { details }),
    });
  }
}

export class InsufficientPermissionsException extends BaseException {
  constructor(requiredPermissions?: string[], message?: string) {
    super({
      errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
      ...(message && { message }),
      details: { requiredPermissions },
    });
  }
}
