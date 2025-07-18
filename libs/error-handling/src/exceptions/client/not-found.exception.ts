import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class NotFoundException extends BaseException {
  constructor(resource?: string, identifier?: unknown) {
    const message =
      resource && identifier
        ? `${resource} com identificador ${identifier} não encontrado`
        : undefined;

    super({
      errorCode: ErrorCode.NOT_FOUND,
      ...(message && { message }),
      details: { resource, identifier },
    });
  }
}

export class DataNotFoundException extends BaseException {
  constructor(entity: string, criteria?: unknown) {
    super({
      errorCode: ErrorCode.DATA_NOT_FOUND,
      message: `${entity} não encontrado`,
      details: { entity, criteria },
    });
  }
}
