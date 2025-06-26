import { Module, Global, DynamicModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters';
import { ErrorLoggingInterceptor } from './interceptors';

export interface ErrorHandlingModuleOptions {
  enableGlobalFilter?: boolean;
  enableErrorLogging?: boolean;
  logLevel?: 'error' | 'warn' | 'debug';
  sanitizeLogs?: boolean;
}

@Global()
@Module({})
export class ErrorHandlingModule {
  static forRoot(options: ErrorHandlingModuleOptions = {}): DynamicModule {
    const {
      enableGlobalFilter = true,
      enableErrorLogging = true
    } = options;

    const providers: any[] = [];

    if (enableGlobalFilter) {
      providers.push({
        provide: APP_FILTER,
        useClass: GlobalExceptionFilter,
      });
    }

    if (enableErrorLogging) {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: ErrorLoggingInterceptor,
      });
    }

    return {
      module: ErrorHandlingModule,
      providers,
      exports: [],
    };
  }
}
