import { ErrorCode } from '../../constants';
import { BaseException } from '../base';
import { ValidationError } from '../../interfaces';

export class DataValidationException extends BaseException {
  constructor(errors: ValidationError[]) {
    super({
      errorCode: ErrorCode.VALIDATION_ERROR,
      message: 'Dados inválidos',
      details: { errors },
    });
  }
}

export class InvalidDataFormatException extends BaseException {
  constructor(field: string, expectedFormat: string, receivedValue?: any) {
    super({
      errorCode: ErrorCode.INVALID_DATA_FORMAT,
      message: `Formato inválido para o campo ${field}. Esperado: ${expectedFormat}`,
      details: { field, expectedFormat, receivedValue },
    });
  }
}
