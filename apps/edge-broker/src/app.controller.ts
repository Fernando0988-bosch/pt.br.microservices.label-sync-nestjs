import { Controller, Get, Param } from '@nestjs/common';
import {
  ValidationException,
  BusinessLogicException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }

  @Get('broker/:id')
  getBrokerData(@Param('id') id: string): { id: string; status: string; service: string } {
    if (!id || id.length < 3) {
      throw new ValidationException([
        {
          field: 'id',
          message: 'ID deve ter pelo menos 3 caracteres',
          value: id,
        },
      ]);
    }

    return this.appService.getBrokerData(id);
  }

  @Get('error')
  testError(): never {
    throw new BusinessLogicException('Erro de teste do Edge Broker');
  }
}
