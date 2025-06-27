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

  @Get('label-config/:id')
  getLabelConfig(@Param('id') id: string): {
    id: string;
    status: string;
    config: { template: string; format: string };
  } {
    if (!id || id.length < 3) {
      throw new ValidationException([
        {
          field: 'id',
          message: 'ID deve ter pelo menos 3 caracteres',
          value: id,
        },
      ]);
    }

    return this.appService.getLabelConfig(id);
  }

  @Get('label-config-specific/:id')
  getLabelConfigSpecific(@Param('id') id: string): {
    id: string;
    status: string;
    config: { template: string; format: string };
  } {
    return this.appService.getLabelConfigWithSpecificError(id);
  }

  @Get('error')
  testError(): never {
    throw new BusinessLogicException('Erro de teste para demonstrar o tratamento de label config');
  }
}
