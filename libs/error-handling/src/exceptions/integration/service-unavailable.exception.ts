import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class ServiceUnavailableException extends BaseException {
  constructor(service: string, reason?: string) {
    super({
      errorCode: ErrorCode.SERVICE_UNAVAILABLE,
      message: `Serviço ${service} temporariamente indisponível${reason ? `: ${reason}` : ''}`,
      details: { service, reason },
      retryable: true,
    });
  }
}
