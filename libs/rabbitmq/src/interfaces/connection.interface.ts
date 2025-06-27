export interface RabbitMQConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost?: string;
  protocol?: 'amqp' | 'amqps';
  heartbeat?: number;
  connectionTimeout?: number;
}

export interface RabbitMQModuleOptions {
  connection: RabbitMQConnectionConfig;
  exchanges?: ExchangeConfig[];
  queues?: QueueConfig[];
  prefetchCount?: number;
  isGlobal?: boolean;
}

export interface ExchangeConfig {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  options?: {
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, any>;
  };
}

export interface QueueConfig {
  name: string;
  options?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, any>;
  };
  bindings?: QueueBinding[];
}

export interface QueueBinding {
  exchange: string;
  routingKey: string;
  arguments?: Record<string, any>;
}

export interface ConnectionStatus {
  isConnected: boolean;
  connectionUrl: string;
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
}