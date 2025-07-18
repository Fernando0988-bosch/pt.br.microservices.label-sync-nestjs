/**
 * SAP Catalog Poller Microservice
 * Responsible for polling SAP data and managing catalog synchronization
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './environments/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Configure global prefix
  app.setGlobalPrefix(environment.globalPrefix);

  // Enable CORS for development
  if (!environment.production) {
    app.enableCors();
  }

  // Start server
  await app.listen(environment.port);

  Logger.log(
    `🚀 SAP Catalog Poller is running on: http://localhost:${environment.port}/${environment.globalPrefix}`,
    'Bootstrap',
  );
  Logger.log(
    `🌍 Environment: ${environment.production ? 'Production' : 'Development'}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting application', error, 'Bootstrap');
  process.exit(1);
});
