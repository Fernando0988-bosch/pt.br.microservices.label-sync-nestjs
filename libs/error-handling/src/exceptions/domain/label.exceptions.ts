import { ErrorCode } from '../../constants';
import { BaseException } from '../base';

export class LabelTemplateNotFoundException extends BaseException {
  constructor(templateId: string) {
    super({
      errorCode: ErrorCode.LABEL_TEMPLATE_NOT_FOUND,
      message: `Template de etiqueta '${templateId}' não encontrado`,
      details: { templateId },
    });
  }
}

export class PrintJobFailedException extends BaseException {
  constructor(jobId: string, reason: string, error?: Error) {
    super({
      errorCode: ErrorCode.PRINT_JOB_FAILED,
      message: `Trabalho de impressão ${jobId} falhou: ${reason}`,
      details: { jobId, reason },
      ...(error && { cause: error }),
      retryable: true,
    });
  }
}

export class PrinterNotAvailableException extends BaseException {
  constructor(printerId: string) {
    super({
      errorCode: ErrorCode.PRINTER_NOT_AVAILABLE,
      message: `Impressora '${printerId}' não está disponível`,
      details: { printerId },
      retryable: true,
    });
  }
}

export class InvalidLabelFormatException extends BaseException {
  constructor(format: string, supportedFormats: string[]) {
    super({
      errorCode: ErrorCode.INVALID_LABEL_FORMAT,
      message: `Formato de etiqueta '${format}' inválido`,
      details: { format, supportedFormats },
    });
  }
}
