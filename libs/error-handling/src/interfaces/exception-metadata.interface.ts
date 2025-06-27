import { ErrorCode } from '../constants';
import { ErrorContext } from './error-response.interface';

export interface ExceptionMetadata {
  errorCode: ErrorCode;
  message?: string;
  details?: unknown;
  context?: ErrorContext;
  cause?: Error;
  retryable?: boolean;
  userMessage?: string;
}
