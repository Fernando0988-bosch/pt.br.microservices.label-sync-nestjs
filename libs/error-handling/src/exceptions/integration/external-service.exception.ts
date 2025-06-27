import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class ExternalServiceException extends BaseException {
  constructor(service: string, error?: Error) {
    super({
      errorCode: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: `Erro ao comunicar com serviço externo: ${service}`,
      details: { service },
      ...(error && { cause: error }),
      retryable: true,
    });
  }
}

export class IntegrationException extends BaseException {
  constructor(system: string, operation: string, error?: Error) {
    super({
      errorCode: ErrorCode.INTEGRATION_ERROR,
      message: `Erro de integração com ${system} durante ${operation}`,
      details: { system, operation },
      ...(error && { cause: error }),
      retryable: true,
    });
  }
}
