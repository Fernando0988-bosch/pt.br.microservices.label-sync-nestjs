import { ConsumeOptions, MessageHandler, DeadLetterConfig } from './message.interface';

export interface IConsumer {
  consume<T>(queue: string, handler: MessageHandler<T>, options?: ConsumeOptions): Promise<string>;
  stop(consumerTag: string): Promise<void>;
  stopAll(): Promise<void>;
  isConsuming(consumerTag: string): boolean;
}

export interface ConsumerConfig {
  queue: string;
  prefetchCount?: number;
  autoAck?: boolean;
  deadLetter?: DeadLetterConfig;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export interface ConsumerStatus {
  consumerTag: string;
  queue: string;
  isActive: boolean;
  messageCount: number;
  lastMessageProcessed?: Date;
  errors: number;
}

export interface ConsumerStats {
  totalConsumers: number;
  activeConsumers: number;
  totalMessagesProcessed: number;
  totalErrors: number;
  consumers: ConsumerStatus[];
}
