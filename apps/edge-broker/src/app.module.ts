import { Module } from '@nestjs/common';
import { ErrorHandlingModule } from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ErrorHandlingModule.forRoot({
      enableGlobalFilter: true,
      enableErrorLogging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
