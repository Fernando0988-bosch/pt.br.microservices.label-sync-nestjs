import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import {
  ValidationException,
  BusinessLogicException,
  ExternalServiceException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('print-job')
  async createPrintJob(@Body() printJobData: any) {
    if (!printJobData.printerId || !printJobData.documentId) {
      throw new ValidationException([
        {
          field: 'printerId',
          message: 'ID da impressora é obrigatório',
          value: printJobData.printerId,
        },
        {
          field: 'documentId',
          message: 'ID do documento é obrigatório',
          value: printJobData.documentId,
        },
      ]);
    }

    return this.appService.createPrintJob(printJobData);
  }

  @Get('print-job/:id')
  async getPrintJobStatus(@Param('id') id: string) {
    if (!id || id.length < 3) {
      throw new ValidationException([
        {
          field: 'id',
          message: 'ID do job de impressão deve ter pelo menos 3 caracteres',
          value: id,
        },
      ]);
    }

    return this.appService.getPrintJobStatus(id);
  }

  @Get('printer/:id/status')
  async getPrinterStatus(@Param('id') id: string) {
    return this.appService.getPrinterStatus(id);
  }

  @Post('queue/process')
  async processQueue() {
    return this.appService.processQueue();
  }

  @Get('error/printer-connection')
  testPrinterConnectionError() {
    throw new ExternalServiceException('Falha na conexão com a impressora HP-001');
  }

  @Get('error/queue-full')
  testQueueError() {
    throw new BusinessLogicException(
      'Fila de impressão está cheia. Aguarde processamento dos jobs pendentes.',
    );
  }
}
