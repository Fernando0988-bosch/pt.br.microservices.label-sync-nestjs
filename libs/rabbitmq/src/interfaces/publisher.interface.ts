import { PublishOptions, RabbitMQMessage } from './message.interface';

export interface IPublisher {
  publish<T>(data: T, options: PublishOptions): Promise<boolean>;
  publishBatch<T>(messages: Array<{ data: T; options: PublishOptions }>): Promise<boolean[]>;
  publishWithConfirm<T>(data: T, options: PublishOptions): Promise<boolean>;
}

export interface PublisherConfig {
  exchange: string;
  routingKey?: string;
  persistent?: boolean;
  mandatory?: boolean;
  immediate?: boolean;
}

export interface PublishResult {
  success: boolean;
  messageId: string;
  timestamp: Date;
  error?: Error;
}

export interface BatchPublishResult {
  total: number;
  successful: number;
  failed: number;
  results: PublishResult[];
}