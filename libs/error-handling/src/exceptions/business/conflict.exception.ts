import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class ConflictException extends BaseException {
  constructor(message: string, details?: any) {
    super({
      errorCode: ErrorCode.CONFLICT,
      message,
      details,
    });
  }
}

export class DuplicateEntryException extends BaseException {
  constructor(entity: string, field: string, value: any) {
    super({
      errorCode: ErrorCode.DUPLICATE_ENTRY,
      message: `${entity} com ${field} '${value}' já existe`,
      details: { entity, field, value },
    });
  }
}
