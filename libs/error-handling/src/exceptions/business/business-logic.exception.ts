import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class BusinessLogicException extends BaseException {
  constructor(message: string, details?: unknown) {
    super({
      errorCode: ErrorCode.BUSINESS_RULE_VIOLATION,
      message,
      ...(details !== undefined && { details }),
    });
  }
}

export class InsufficientResourcesException extends BaseException {
  constructor(resource: string, required: number, available: number) {
    super({
      errorCode: ErrorCode.INSUFFICIENT_RESOURCES,
      message: `${resource} insuficiente. Necessário: ${required}, Disponível: ${available}`,
      details: { resource, required, available },
    });
  }
}

export class OperationNotAllowedException extends BaseException {
  constructor(operation: string, reason: string) {
    super({
      errorCode: ErrorCode.OPERATION_NOT_ALLOWED,
      message: `Operação '${operation}' não permitida: ${reason}`,
      details: { operation, reason },
    });
  }
}
