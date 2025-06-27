import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class QueueException extends BaseException {
  constructor(message: string, cause?: Error) {
    super({
      errorCode: ErrorCode.BUSINESS_RULE_VIOLATION,
      message,
      ...(cause && { cause }),
      retryable: false,
    });
  }
}
