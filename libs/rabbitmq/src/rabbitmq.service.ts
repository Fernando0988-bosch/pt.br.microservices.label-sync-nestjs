import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  ConnectionStatus,
  ExchangeConfig,
  QueueConfig,
  RabbitMQModuleOptions,
  RabbitMQConnection,
} from './interfaces';
import {
  RabbitMQConnectionException,
  ExternalServiceException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: RabbitMQConnection | null = null;
  private channel: amqp.Channel | null = null;
  private connectionStatus: ConnectionStatus;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000;

  constructor(
    @Inject('RABBITMQ_OPTIONS') private readonly options: RabbitMQModuleOptions,
  ) {
    this.connectionStatus = {
      isConnected: false,
      connectionUrl: this.buildConnectionUrl(),
      reconnectAttempts: 0,
    };
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      this.logger.log('Attempting to connect to RabbitMQ...');

      const connectionUrl = this.buildConnectionUrl();
      this.connection = (await amqp.connect(connectionUrl, {
        heartbeat: this.options.connection.heartbeat ?? 60,
        timeout: this.options.connection.connectionTimeout ?? 10000,
      })) as RabbitMQConnection;

      if (this.connection) {
        this.channel = (await this.connection.createChannel()) as amqp.Channel;
      }

      if (this.options.prefetchCount && this.channel) {
        await this.channel.prefetch(this.options.prefetchCount);
      }

      this.setupConnectionEventHandlers();
      await this.setupTopology();

      this.connectionStatus = {
        ...this.connectionStatus,
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      };

      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastDisconnected = new Date();

      throw new RabbitMQConnectionException(error as Error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastDisconnected = new Date();

      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error during RabbitMQ disconnection', error);
    }
  }

  getChannel(): amqp.Channel {
    if (!this.channel || !this.connectionStatus.isConnected) {
      throw new RabbitMQConnectionException(new Error('No active RabbitMQ connection'));
    }
    return this.channel;
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  async assertExchange(config: ExchangeConfig): Promise<void> {
    const channel = this.getChannel();
    await channel.assertExchange(config.name, config.type, config.options ?? { durable: true });
  }

  async assertQueue(config: QueueConfig): Promise<amqp.Replies.AssertQueue> {
    const channel = this.getChannel();
    const queueResult = await channel.assertQueue(config.name, config.options ?? { durable: true });

    if (config.bindings) {
      for (const binding of config.bindings) {
        await channel.bindQueue(
          config.name,
          binding.exchange,
          binding.routingKey,
          binding.arguments,
        );
      }
    }

    return queueResult;
  }

  async deleteQueue(
    queueName: string,
    options?: { ifUnused?: boolean; ifEmpty?: boolean },
  ): Promise<void> {
    const channel = this.getChannel();
    await channel.deleteQueue(queueName, options);
  }

  async purgeQueue(queueName: string): Promise<amqp.Replies.PurgeQueue> {
    const channel = this.getChannel();
    return await channel.purgeQueue(queueName);
  }

  async getQueueInfo(queueName: string): Promise<amqp.Replies.AssertQueue> {
    const channel = this.getChannel();
    return await channel.checkQueue(queueName);
  }

  private buildConnectionUrl(): string {
    const { host, port, username, password, vhost, protocol } = this.options.connection;
    const vhostPath = vhost ? `/${vhost}` : '';
    return `${protocol ?? 'amqp'}://${username}:${password}@${host}:${port}${vhostPath}`;
  }

  private setupConnectionEventHandlers(): void {
    if (!this.connection) {
      return;
    }

    this.connection.on('error', (error?: Error) => {
      this.logger.error('RabbitMQ connection error', error);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastDisconnected = new Date();
      this.scheduleReconnect();
    });

    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed');
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastDisconnected = new Date();
      this.scheduleReconnect();
    });

    if (this.channel) {
      this.channel.on('error', (error: Error) => {
        this.logger.error('RabbitMQ channel error', error);
      });

      this.channel.on('close', () => {
        this.logger.warn('RabbitMQ channel closed');
      });
    }
  }

  private scheduleReconnect(): void {
    if (
      this.reconnectTimer ??
      this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    this.connectionStatus.reconnectAttempts++;

    this.logger.log(
      `Scheduling reconnection attempt ${this.connectionStatus.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      void (async () => {
        this.reconnectTimer = null;
        try {
          await this.connect();
        } catch (error) {
          this.logger.error('Reconnection failed', error);
        }
      })();
    }, this.reconnectDelay);
  }

  private async setupTopology(): Promise<void> {
    try {
      if (this.options.exchanges) {
        for (const exchange of this.options.exchanges) {
          await this.assertExchange(exchange);
        }
      }

      if (this.options.queues) {
        for (const queue of this.options.queues) {
          await this.assertQueue(queue);
        }
      }

      this.logger.log('RabbitMQ topology setup completed');
    } catch (error) {
      this.logger.error('Failed to setup RabbitMQ topology', error);
      throw new ExternalServiceException('RabbitMQ topology setup failed', error as Error);
    }
  }
}
