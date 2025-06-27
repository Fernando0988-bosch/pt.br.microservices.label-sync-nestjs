export interface RabbitMQMessage<T = unknown> {
  id: string;
  timestamp: Date;
  data: T;
  correlationId?: string;
  replyTo?: string;
  headers?: Record<string, unknown>;
  properties?: MessageProperties;
}

export interface MessageProperties {
  persistent?: boolean;
  priority?: number;
  expiration?: string | number;
  messageId?: string;
  timestamp?: number;
  type?: string;
  userId?: string;
  appId?: string;
  clusterId?: string;
}

export interface PublishOptions extends MessageProperties {
  exchange?: string;
  routingKey: string;
  mandatory?: boolean;
  immediate?: boolean;
}

export interface ConsumeOptions {
  queue: string;
  consumerTag?: string;
  noLocal?: boolean;
  noAck?: boolean;
  exclusive?: boolean;
  priority?: number;
  arguments?: Record<string, unknown>;
}

export interface MessageHandler<T = unknown> {
  (message: RabbitMQMessage<T>, ack: () => void, nack: (requeue?: boolean) => void): Promise<void> | void;
}

export interface DeadLetterConfig {
  exchange: string;
  routingKey: string;
  maxRetries?: number;
}