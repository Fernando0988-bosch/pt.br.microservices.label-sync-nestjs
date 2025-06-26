import { ErrorCode } from '../../constants';
import { BaseException } from '../base';
import { ValidationError } from '../../interfaces';

export class BadRequestException extends BaseException {
  constructor(message?: string, details?: any) {
    super({
      errorCode: ErrorCode.BAD_REQUEST,
      message,
      details,
    });
  }
}

export class ValidationException extends BaseException {
  constructor(errors: ValidationError[], message?: string) {
    super({
      errorCode: ErrorCode.VALIDATION_ERROR,
      message,
      details: { errors },
    });
  }
}
