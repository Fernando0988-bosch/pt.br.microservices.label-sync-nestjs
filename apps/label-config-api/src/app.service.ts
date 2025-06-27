import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
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
  getLabelConfig(id: string): {
    id: string;
    status: string;
    config: { template: string; format: string };
  } {
    const data = this.simulateLabelConfigCall(id);

    if (!data) {
      throw new NotFoundException('Configuração de Label', id);
    }

    if (data.status === 'INACTIVE') {
      throw new BusinessLogicException('Configuração de label está inativa para processamento');
    }

    return data;
  }

  getLabelConfigWithSpecificError(id: string): {
    id: string;
    status: string;
    config: { template: string; format: string };
  } {
    try {
      const data = this.simulateLabelConfigCall(id);
      if (!data) {
        throw new NotFoundException('Configuração de Label', id);
      }
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('LABEL_CONFIG')) {
        throw new ExternalServiceException(
          'Falha na conexão com o serviço de configuração de labels',
          error,
        );
      }
      throw error;
    }
  }

  private simulateLabelConfigCall(id: string): {
    id: string;
    status: string;
    config: { template: string; format: string };
  } {
    if (id === 'error') {
      throw new Error('LABEL_CONFIG connection failed');
    }
    return { id, status: 'ACTIVE', config: { template: 'default', format: 'json' } };
  }

  getData(): { message: string } {
    return { message: 'Hello Label Config API with Error Handling!' };
  }
}
