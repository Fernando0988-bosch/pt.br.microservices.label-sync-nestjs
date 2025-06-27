import { SetMetadata } from '@nestjs/common';
import { PublishOptions } from '../interfaces';

export const RABBITMQ_PUBLISHER_METADATA = 'rabbitmq:publisher';

export interface PublisherMetadata {
  exchange?: string;
  routingKey?: string;
  defaultOptions?: Partial<PublishOptions>;
}

export function RabbitMQPublisher(
  exchange?: string,
  routingKey?: string,
  defaultOptions?: Partial<PublishOptions>
): ClassDecorator {
  return SetMetadata(RABBITMQ_PUBLISHER_METADATA, {
    exchange,
    routingKey,
    defaultOptions
  } as PublisherMetadata);
}

export function ExchangePublisher(
  exchangeName: string,
  defaultRoutingKey?: string,
  defaultOptions?: Partial<PublishOptions>
): ClassDecorator {
  return RabbitMQPublisher(exchangeName, defaultRoutingKey, defaultOptions);
}

export function QueuePublisher(
  queueName: string,
  defaultOptions?: Partial<PublishOptions>
): ClassDecorator {
  return RabbitMQPublisher('', queueName, defaultOptions);
}