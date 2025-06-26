import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class QueueNotFoundException extends BaseException {
  constructor(queueName: string) {
    super({
      errorCode: ErrorCode.QUEUE_NOT_FOUND,
      message: `Fila '${queueName}' não encontrada`,
      details: { queueName },
    });
  }
}

export class MessageProcessingException extends BaseException {
  constructor(queueName: string, messageId: string, error?: Error) {
    super({
      errorCode: ErrorCode.MESSAGE_PROCESSING_ERROR,
      message: `Erro ao processar mensagem ${messageId} da fila ${queueName}`,
      details: { queueName, messageId },
      cause: error,
      retryable: true,
    });
  }
}

export class QueueConnectionException extends BaseException {
  constructor(error?: Error) {
    super({
      errorCode: ErrorCode.QUEUE_CONNECTION_ERROR,
      message: 'Erro ao conectar com RabbitMQ',
      cause: error,
      retryable: true,
    });
  }
}
