import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class PrinterConnectionException extends BaseException {
  constructor(message: string, cause?: Error) {
    super({
      errorCode: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message,
      ...(cause && { cause }),
      retryable: true,
    });
  }
}
