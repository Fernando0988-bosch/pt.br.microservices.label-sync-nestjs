import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { PublisherService } from './publishers';
import { ConsumerService } from './consumers';
import { 
  PublishOptions, 
  ConsumeOptions, 
  MessageHandler, 
  RetryPolicy,
  ExchangeConfig,
  QueueConfig,
  ConnectionStatus,
  ConsumerStats
} from './interfaces';

@Injectable()
export class RabbitMQHelperService {
  private readonly logger = new Logger(RabbitMQHelperService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly publisherService: PublisherService,
    private readonly consumerService: ConsumerService
  ) {}

  async setupExchange(config: ExchangeConfig): Promise<void> {
    await this.rabbitMQService.assertExchange(config);
    this.logger.log(`Exchange ${config.name} setup completed`);
  }

  async setupQueue(config: QueueConfig): Promise<void> {
    await this.rabbitMQService.assertQueue(config);
    this.logger.log(`Queue ${config.name} setup completed`);
  }

  async publishMessage<T>(
    exchange: string,
    routingKey: string,
    data: T,
    options?: Partial<PublishOptions>
  ): Promise<boolean> {
    const publishOptions: PublishOptions = {
      exchange,
      routingKey,
      persistent: true,
      ...options
    };

    return this.publisherService.publish(data, publishOptions);
  }

  async publishToQueue<T>(
    queueName: string,
    data: T,
    options?: Partial<PublishOptions>
  ): Promise<boolean> {
    return this.publisherService.publishToQueue(queueName, data, options);
  }

  async startConsumer<T>(
    queue: string,
    handler: MessageHandler<T>,
    options?: ConsumeOptions
  ): Promise<string> {
    return this.consumerService.consume(queue, handler, options);
  }

  async startRetryableConsumer<T>(
    queue: string,
    handler: MessageHandler<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    options?: ConsumeOptions
  ): Promise<string> {
    const retryPolicy: RetryPolicy = {
      maxRetries,
      initialDelay,
      backoffMultiplier: 2,
      maxDelay: 30000
    };

    return this.consumerService.consumeWithRetry(queue, handler, retryPolicy, options);
  }

  async createWorkQueue(queueName: string, durable: boolean = true): Promise<void> {
    const queueConfig: QueueConfig = {
      name: queueName,
      options: { durable }
    };

    await this.setupQueue(queueConfig);
  }

  async createTopicExchange(
    exchangeName: string,
    queueConfigs: Array<{ queueName: string; routingKeys: string[] }>
  ): Promise<void> {
    const exchangeConfig: ExchangeConfig = {
      name: exchangeName,
      type: 'topic',
      options: { durable: true }
    };

    await this.setupExchange(exchangeConfig);

    for (const { queueName, routingKeys } of queueConfigs) {
      const queueConfig: QueueConfig = {
        name: queueName,
        options: { durable: true },
        bindings: routingKeys.map(routingKey => ({
          exchange: exchangeName,
          routingKey
        }))
      };

      await this.setupQueue(queueConfig);
    }
  }

  async createFanoutExchange(
    exchangeName: string,
    queueNames: string[]
  ): Promise<void> {
    const exchangeConfig: ExchangeConfig = {
      name: exchangeName,
      type: 'fanout',
      options: { durable: true }
    };

    await this.setupExchange(exchangeConfig);

    for (const queueName of queueNames) {
      const queueConfig: QueueConfig = {
        name: queueName,
        options: { durable: true },
        bindings: [{
          exchange: exchangeName,
          routingKey: ''
        }]
      };

      await this.setupQueue(queueConfig);
    }
  }

  async getConnectionHealth(): Promise<{
    isHealthy: boolean;
    connectionStatus: ConnectionStatus;
    consumerStats: ConsumerStats;
  }> {
    const connectionStatus = this.rabbitMQService.getConnectionStatus();
    const consumerStats = this.consumerService.getConsumerStats();

    return {
      isHealthy: connectionStatus.isConnected && consumerStats.totalErrors === 0,
      connectionStatus,
      consumerStats
    };
  }

  async purgeQueue(queueName: string): Promise<void> {
    await this.rabbitMQService.purgeQueue(queueName);
    this.logger.log(`Queue ${queueName} purged`);
  }

  async deleteQueue(queueName: string): Promise<void> {
    await this.rabbitMQService.deleteQueue(queueName);
    this.logger.log(`Queue ${queueName} deleted`);
  }

  async stopAllConsumers(): Promise<void> {
    await this.consumerService.stopAll();
    this.logger.log('All consumers stopped');
  }
}