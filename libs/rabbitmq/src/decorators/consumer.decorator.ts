import { SetMetadata } from '@nestjs/common';
import { ConsumeOptions, RetryPolicy } from '../interfaces';

export const RABBITMQ_CONSUMER_METADATA = 'rabbitmq:consumer';

export interface ConsumerMetadata {
  queue: string;
  options?: ConsumeOptions;
  retryPolicy?: RetryPolicy;
}

export function RabbitMQConsumer(
  queue: string,
  options?: ConsumeOptions,
  retryPolicy?: RetryPolicy,
): MethodDecorator {
  return SetMetadata(RABBITMQ_CONSUMER_METADATA, {
    queue,
    options,
    retryPolicy,
  } as ConsumerMetadata);
}

export function QueueConsumer(
  queueName: string,
  options?: Partial<ConsumeOptions>,
): MethodDecorator {
  return RabbitMQConsumer(queueName, { queue: queueName, ...options });
}

export function RetryableConsumer(
  queue: string,
  maxRetries = 3,
  initialDelay = 1000,
  backoffMultiplier = 2,
  maxDelay = 30000,
): MethodDecorator {
  const retryPolicy: RetryPolicy = {
    maxRetries,
    initialDelay,
    backoffMultiplier,
    maxDelay,
  };

  return RabbitMQConsumer(queue, { queue }, retryPolicy);
}
