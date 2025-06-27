import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RabbitMQService } from '../rabbitmq.service';
import { 
  IPublisher, 
  PublishOptions, 
  PublishResult, 
  BatchPublishResult,
  RabbitMQMessage 
} from '../interfaces';
import { 
  RabbitMQConnectionException,
  ExternalServiceException 
} from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class PublisherService implements IPublisher {
  private readonly logger = new Logger(PublisherService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish<T>(data: T, options: PublishOptions): Promise<boolean> {
    try {
      const channel = this.rabbitMQService.getChannel();
      const message = this.createMessage(data, options);
      
      const buffer = Buffer.from(JSON.stringify(message));
      
      const result = channel.publish(
        options.exchange || '',
        options.routingKey,
        buffer,
        {
          persistent: options.persistent !== false,
          mandatory: options.mandatory || false,
          immediate: options.immediate || false,
          messageId: message.id,
          timestamp: message.timestamp.getTime(),
          correlationId: options.correlationId,
          replyTo: options.replyTo,
          headers: options.headers,
          ...options
        }
      );

      if (!result) {
        this.logger.warn(`Message publish returned false for ${options.routingKey}`);
      }

      this.logger.debug(`Published message to ${options.exchange}/${options.routingKey}`);
      return result;
      
    } catch (error) {
      this.logger.error(`Failed to publish message to ${options.routingKey}`, error);
      throw new ExternalServiceException('Failed to publish message', error as Error);
    }
  }

  async publishBatch<T>(messages: Array<{ data: T; options: PublishOptions }>): Promise<boolean[]> {
    const results: boolean[] = [];
    
    try {
      for (const { data, options } of messages) {
        const result = await this.publish(data, options);
        results.push(result);
      }
      
      this.logger.debug(`Published batch of ${messages.length} messages`);
      return results;
      
    } catch (error) {
      this.logger.error('Failed to publish message batch', error);
      throw new ExternalServiceException('Failed to publish message batch', error as Error);
    }
  }

  async publishWithConfirm<T>(data: T, options: PublishOptions): Promise<boolean> {
    try {
      const channel = this.rabbitMQService.getChannel();
      
      return new Promise((resolve, reject) => {
        const message = this.createMessage(data, options);
        const buffer = Buffer.from(JSON.stringify(message));
        
        channel.publish(
          options.exchange || '',
          options.routingKey,
          buffer,
          {
            persistent: options.persistent !== false,
            mandatory: options.mandatory || false,
            immediate: options.immediate || false,
            messageId: message.id,
            timestamp: message.timestamp.getTime(),
            correlationId: options.correlationId,
            replyTo: options.replyTo,
            headers: options.headers,
            ...options
          },
          (error, ok) => {
            if (error) {
              this.logger.error(`Confirmed publish failed for ${options.routingKey}`, error);
              reject(new ExternalServiceException('Confirmed publish failed', error));
            } else {
              this.logger.debug(`Confirmed publish to ${options.exchange}/${options.routingKey}`);
              resolve(true);
            }
          }
        );
      });
      
    } catch (error) {
      this.logger.error(`Failed to publish with confirmation to ${options.routingKey}`, error);
      throw new ExternalServiceException('Failed to publish with confirmation', error as Error);
    }
  }

  async publishBatchWithResults<T>(
    messages: Array<{ data: T; options: PublishOptions }>
  ): Promise<BatchPublishResult> {
    const results: PublishResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const { data, options } of messages) {
      try {
        const success = await this.publish(data, options);
        const result: PublishResult = {
          success,
          messageId: randomUUID(),
          timestamp: new Date()
        };
        
        if (success) {
          successful++;
        } else {
          failed++;
        }
        
        results.push(result);
        
      } catch (error) {
        failed++;
        results.push({
          success: false,
          messageId: randomUUID(),
          timestamp: new Date(),
          error: error as Error
        });
      }
    }

    return {
      total: messages.length,
      successful,
      failed,
      results
    };
  }

  async publishToQueue<T>(queueName: string, data: T, options?: Partial<PublishOptions>): Promise<boolean> {
    const publishOptions: PublishOptions = {
      exchange: '',
      routingKey: queueName,
      persistent: true,
      ...options
    };

    return this.publish(data, publishOptions);
  }

  async publishToExchange<T>(
    exchangeName: string, 
    routingKey: string, 
    data: T, 
    options?: Partial<PublishOptions>
  ): Promise<boolean> {
    const publishOptions: PublishOptions = {
      exchange: exchangeName,
      routingKey,
      persistent: true,
      ...options
    };

    return this.publish(data, publishOptions);
  }

  private createMessage<T>(data: T, options: PublishOptions): RabbitMQMessage<T> {
    return {
      id: randomUUID(),
      timestamp: new Date(),
      data,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      headers: options.headers,
      properties: {
        persistent: options.persistent,
        priority: options.priority,
        expiration: options.expiration,
        messageId: options.messageId,
        timestamp: options.timestamp,
        type: options.type,
        userId: options.userId,
        appId: options.appId,
        clusterId: options.clusterId
      }
    };
  }
}