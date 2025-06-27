import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  BusinessLogicException,
  ExternalServiceException,
  RabbitMQConnectionException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { CatchErrors, RetryOnError } from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class AppService {
  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(3, 1000)
  async getBrokerData(id: string) {
    const data = await this.simulateBrokerCall(id);

    if (!data) {
      throw new NotFoundException('Dados Broker', id);
    }

    if (data.status === 'UNAVAILABLE') {
      throw new BusinessLogicException('Serviço de broker está indisponível');
    }

    return data;
  }

  async testRabbitMQConnection(id: string) {
    try {
      const connection = await this.simulateRabbitMQConnection(id);
      if (!connection) {
        throw new NotFoundException('Conexão RabbitMQ', id);
      }
      return connection;
    } catch (error) {
      if (error instanceof Error && error.message.includes('RabbitMQ')) {
        throw new RabbitMQConnectionException(error);
      }
      throw error;
    }
  }

  private async simulateBrokerCall(id: string) {
    if (id === 'error') {
      throw new Error('Broker connection failed');
    }
    return { id, status: 'AVAILABLE', service: 'edge-broker' };
  }

  private async simulateRabbitMQConnection(id: string) {
    if (id === 'rabbitmq-error') {
      throw new Error('RabbitMQ connection timeout');
    }
    return { id, connected: true, queue: 'edge-broker-queue' };
  }

  getData(): { message: string } {
    return { message: 'Hello Edge Broker API with Error Handling!' };
  }
}
