import { ErrorCode } from '../constants';

export interface ErrorResponse {
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
  path?: string;
  method?: string;
  correlationId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ErrorContext {
  service?: string;
  operation?: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}
