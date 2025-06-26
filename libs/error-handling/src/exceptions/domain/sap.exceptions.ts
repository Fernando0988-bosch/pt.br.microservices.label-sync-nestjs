import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class SapConnectionException extends BaseException {
  constructor(error?: Error) {
    super({
      errorCode: ErrorCode.SAP_CONNECTION_ERROR,
      message: 'Erro ao conectar com SAP',
      cause: error,
      retryable: true,
    });
  }
}

export class SapDataSyncException extends BaseException {
  constructor(entity: string, operation: string, error?: Error) {
    super({
      errorCode: ErrorCode.SAP_DATA_SYNC_ERROR,
      message: `Erro ao sincronizar ${entity} com SAP durante ${operation}`,
      details: { entity, operation },
      cause: error,
      retryable: true,
    });
  }
}

export class SapAuthenticationException extends BaseException {
  constructor(error?: Error) {
    super({
      errorCode: ErrorCode.SAP_AUTHENTICATION_ERROR,
      message: 'Falha na autenticação com SAP',
      cause: error,
    });
  }
}
