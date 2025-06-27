import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class RabbitMQConnectionException extends BaseException {
  constructor(cause?: Error) {
    super({
      errorCode: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: 'Falha na conexão com RabbitMQ',
      ...(cause && { cause }),
      retryable: true,
    });
  }
}
