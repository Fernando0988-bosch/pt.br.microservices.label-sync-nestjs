import { BaseException } from '../exceptions/base';
import { Logger } from '@nestjs/common';
import { ExternalServiceException } from '../exceptions/integration';

export interface CatchErrorsOptions {
  logErrors?: boolean;
  rethrow?: boolean;
  defaultException?: new (service: string, error?: Error) => BaseException;
  ignoreErrors?: (new (...args: unknown[]) => Error)[];
  onError?: (error: Error, context: Record<string, unknown>) => void;
  fallbackValue?: unknown;
}

export function CatchErrors(options: CatchErrorsOptions = {}): MethodDecorator {
  const {
    logErrors = true,
    rethrow = true,
    defaultException = ExternalServiceException,
    ignoreErrors = [],
    onError,
    fallbackValue = null,
  } = options;

  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = String(propertyKey);
    const logger = new Logger(`${className}.${methodName}`);

    descriptor.value = async function (...args: unknown[]) {
      const context = {
        className,
        methodName,
        args: args.length,
        timestamp: new Date().toISOString(),
      };

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error: unknown) {
        if (ignoreErrors.some((ErrorType) => error instanceof ErrorType)) {
          return fallbackValue;
        }

        if (logErrors && error instanceof Error) {
          logger.error(`Error in ${className}.${methodName}:`, {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            context,
          });
        }

        if (onError && error instanceof Error) {
          try {
            onError(error, context);
          } catch (callbackError) {
            logger.error('Error in onError callback:', callbackError);
          }
        }

        if (error instanceof BaseException) {
          if (rethrow) {
            throw error;
          }
          return fallbackValue;
        }

        if (defaultException && error instanceof Error) {
          const exception = new defaultException(`${className}.${methodName}`, error);
          if (rethrow) {
            throw exception;
          }
          return fallbackValue;
        }

        if (rethrow) {
          throw error;
        }
        return fallbackValue;
      }
    };

    return descriptor;
  };
}

export function RetryOnError(retries = 3, delay = 1000): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${String(propertyKey)}`);

    descriptor.value = async function (...args: unknown[]) {
      let lastError: unknown;

      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt <= retries && error instanceof BaseException && error.isRetryable()) {
            logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
              error: error.message,
              errorCode: error.errorCode,
            });

            await new Promise((resolve) => setTimeout(resolve, delay * attempt));
            continue;
          }

          break;
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}
