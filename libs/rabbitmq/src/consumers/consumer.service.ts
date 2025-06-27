import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQService } from '../rabbitmq.service';
import { 
  IConsumer, 
  ConsumeOptions, 
  MessageHandler, 
  ConsumerStatus, 
  ConsumerStats,
  RabbitMQMessage,
  RetryPolicy 
} from '../interfaces';
import { 
  RabbitMQConnectionException,
  ExternalServiceException 
} from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class ConsumerService implements IConsumer, OnModuleDestroy {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly consumers = new Map<string, ConsumerStatus>();
  private readonly retryQueues = new Map<string, string>();

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleDestroy() {
    await this.stopAll();
  }

  async consume<T>(
    queue: string, 
    handler: MessageHandler<T>, 
    options: ConsumeOptions = { queue }
  ): Promise<string> {
    try {
      const channel = this.rabbitMQService.getChannel();
      
      const consumeOptions = {
        noAck: options.noAck || false,
        exclusive: options.exclusive || false,
        priority: options.priority || 0,
        arguments: options.arguments || {}
      };

      const consumerResult = await channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;
          
          await this.handleMessage(msg, handler, consumeOptions.noAck, queue);
        },
        consumeOptions
      );

      const consumerTag = consumerResult.consumerTag;
      
      this.consumers.set(consumerTag, {
        consumerTag,
        queue,
        isActive: true,
        messageCount: 0,
        errors: 0
      });

      this.logger.log(`Started consumer ${consumerTag} for queue ${queue}`);
      return consumerTag;
      
    } catch (error) {
      this.logger.error(`Failed to start consumer for queue ${queue}`, error);
      throw new ExternalServiceException('Failed to start consumer', error as Error);
    }
  }

  async consumeWithRetry<T>(
    queue: string,
    handler: MessageHandler<T>,
    retryPolicy: RetryPolicy,
    options: ConsumeOptions = { queue }
  ): Promise<string> {
    await this.setupRetryQueue(queue, retryPolicy);
    
    return this.consume(queue, async (message, ack, nack) => {
      try {
        await handler(message, ack, nack);
      } catch (error) {
        await this.handleRetry(message, error as Error, retryPolicy, queue);
        nack(false);
      }
    }, options);
  }

  async stop(consumerTag: string): Promise<void> {
    try {
      const channel = this.rabbitMQService.getChannel();
      await channel.cancel(consumerTag);
      
      const consumer = this.consumers.get(consumerTag);
      if (consumer) {
        consumer.isActive = false;
        this.consumers.delete(consumerTag);
      }
      
      this.logger.log(`Stopped consumer ${consumerTag}`);
      
    } catch (error) {
      this.logger.error(`Failed to stop consumer ${consumerTag}`, error);
      throw new ExternalServiceException('Failed to stop consumer', error as Error);
    }
  }

  async stopAll(): Promise<void> {
    const consumerTags = Array.from(this.consumers.keys());
    
    for (const consumerTag of consumerTags) {
      try {
        await this.stop(consumerTag);
      } catch (error) {
        this.logger.error(`Failed to stop consumer ${consumerTag}`, error);
      }
    }
    
    this.logger.log('Stopped all consumers');
  }

  isConsuming(consumerTag: string): boolean {
    const consumer = this.consumers.get(consumerTag);
    return consumer?.isActive || false;
  }

  getConsumerStats(): ConsumerStats {
    const consumers = Array.from(this.consumers.values());
    const activeConsumers = consumers.filter(c => c.isActive).length;
    const totalMessagesProcessed = consumers.reduce((sum, c) => sum + c.messageCount, 0);
    const totalErrors = consumers.reduce((sum, c) => sum + c.errors, 0);

    return {
      totalConsumers: consumers.length,
      activeConsumers,
      totalMessagesProcessed,
      totalErrors,
      consumers
    };
  }

  async pauseConsumer(consumerTag: string): Promise<void> {
    const consumer = this.consumers.get(consumerTag);
    if (consumer) {
      consumer.isActive = false;
      this.logger.log(`Paused consumer ${consumerTag}`);
    }
  }

  async resumeConsumer(consumerTag: string): Promise<void> {
    const consumer = this.consumers.get(consumerTag);
    if (consumer) {
      consumer.isActive = true;
      this.logger.log(`Resumed consumer ${consumerTag}`);
    }
  }

  private async handleMessage<T>(
    msg: amqp.ConsumeMessage,
    handler: MessageHandler<T>,
    noAck: boolean,
    queue: string
  ): Promise<void> {
    const consumerTag = msg.fields.consumerTag;
    const consumer = this.consumers.get(consumerTag);
    
    if (!consumer || !consumer.isActive) {
      return;
    }

    try {
      const messageContent = msg.content.toString();
      const parsedMessage: RabbitMQMessage<T> = JSON.parse(messageContent);
      
      const channel = this.rabbitMQService.getChannel();
      
      const ack = () => {
        if (!noAck) {
          channel.ack(msg);
        }
      };
      
      const nack = (requeue = true) => {
        if (!noAck) {
          channel.nack(msg, false, requeue);
        }
      };

      await handler(parsedMessage, ack, nack);
      
      consumer.messageCount++;
      consumer.lastMessageProcessed = new Date();
      
      this.logger.debug(`Processed message from queue ${queue}`);
      
    } catch (error) {
      if (consumer) {
        consumer.errors++;
      }
      
      this.logger.error(`Error handling message from queue ${queue}`, error);
      
      if (!noAck) {
        const channel = this.rabbitMQService.getChannel();
        channel.nack(msg, false, false);
      }
    }
  }

  private async setupRetryQueue(originalQueue: string, retryPolicy: RetryPolicy): Promise<void> {
    const retryQueueName = `${originalQueue}.retry`;
    const deadLetterQueueName = `${originalQueue}.dead-letter`;
    
    try {
      const channel = this.rabbitMQService.getChannel();
      
      await channel.assertQueue(deadLetterQueueName, { durable: true });
      
      await channel.assertQueue(retryQueueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': originalQueue,
          'x-message-ttl': retryPolicy.initialDelay
        }
      });
      
      this.retryQueues.set(originalQueue, retryQueueName);
      
    } catch (error) {
      this.logger.error(`Failed to setup retry queue for ${originalQueue}`, error);
      throw new ExternalServiceException('Failed to setup retry queue', error as Error);
    }
  }

  private async handleRetry<T>(
    message: RabbitMQMessage<T>,
    error: Error,
    retryPolicy: RetryPolicy,
    originalQueue: string
  ): Promise<void> {
    const retryCount = (message.headers?.['x-retry-count'] || 0) + 1;
    
    if (retryCount > retryPolicy.maxRetries) {
      this.logger.error(`Message exceeded max retries (${retryPolicy.maxRetries}), sending to dead letter queue`, {
        messageId: message.id,
        error: error.message
      });
      return;
    }

    const retryQueue = this.retryQueues.get(originalQueue);
    if (!retryQueue) {
      this.logger.error(`No retry queue found for ${originalQueue}`);
      return;
    }

    try {
      const channel = this.rabbitMQService.getChannel();
      const delay = Math.min(
        retryPolicy.initialDelay * Math.pow(retryPolicy.backoffMultiplier, retryCount - 1),
        retryPolicy.maxDelay
      );

      const retryMessage = {
        ...message,
        headers: {
          ...message.headers,
          'x-retry-count': retryCount,
          'x-original-error': error.message,
          'x-retry-delay': delay
        }
      };

      const buffer = Buffer.from(JSON.stringify(retryMessage));
      
      channel.sendToQueue(retryQueue, buffer, {
        persistent: true,
        headers: retryMessage.headers
      });

      this.logger.warn(`Scheduled retry ${retryCount}/${retryPolicy.maxRetries} for message ${message.id} with delay ${delay}ms`);
      
    } catch (retryError) {
      this.logger.error(`Failed to schedule retry for message ${message.id}`, retryError);
    }
  }
}