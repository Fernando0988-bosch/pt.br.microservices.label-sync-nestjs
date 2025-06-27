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

  @Get('sap/:id')
  getSapData(@Param('id') id: string): { id: string; status: string; data: unknown } {
    if (!id || id.length < 3) {
      throw new ValidationException([
        {
          field: 'id',
          message: 'ID deve ter pelo menos 3 caracteres',
          value: id,
        },
      ]);
    }

    return this.appService.getSapData(id);
  }

  @Get('sap-specific/:id')
  getSapDataSpecific(@Param('id') id: string): { id: string; status: string; data: unknown } {
    return this.appService.getSapDataWithSpecificError(id);
  }

  @Get('error')
  testError(): never {
    throw new BusinessLogicException('Erro de teste para demonstrar o tratamento');
  }
}
