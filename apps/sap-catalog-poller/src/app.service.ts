import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  SapConnectionException,
  BusinessLogicException,
  ExternalServiceException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { CatchErrors, RetryOnError } from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class AppService {
  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(3, 1000)
  getSapData(id: string): { id: string; status: string; data: unknown } {
    const data = this.simulateSapCall(id);

    if (!data) {
      throw new NotFoundException('Dados SAP', id);
    }

    if (data.status === 'INACTIVE') {
      throw new BusinessLogicException('Dados SAP estão inativos para processamento');
    }

    return data;
  }

  getSapDataWithSpecificError(id: string): { id: string; status: string; data: unknown } {
    try {
      const data = this.simulateSapCall(id);
      if (!data) {
        throw new NotFoundException('Dados SAP', id);
      }
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('SAP')) {
        throw new SapConnectionException(error);
      }
      throw error;
    }
  }

  private simulateSapCall(id: string): { id: string; status: string; data: unknown } {
    if (id === 'error') {
      throw new Error('SAP connection failed');
    }
    return { id, status: 'ACTIVE', data: 'sample' };
  }

  getData(): { message: string } {
    return { message: 'Hello API with Error Handling!' };
  }
}
