import { ErrorCode } from '../../constants';
import { BaseException } from '../base';
import { ValidationError } from '../../interfaces';

export class BadRequestException extends BaseException {
  constructor(message?: string, details?: unknown) {
    super({
      errorCode: ErrorCode.BAD_REQUEST,
      ...(message && { message }),
      ...(details !== undefined && { details }),
    });
  }
}

export class ValidationException extends BaseException {
  constructor(errors: ValidationError[], message?: string) {
    super({
      errorCode: ErrorCode.VALIDATION_ERROR,
      ...(message && { message }),
      details: { errors },
    });
  }
}
