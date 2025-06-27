import { Module, DynamicModule, Global, Provider, Type, ForwardReference, InjectionToken, OptionalFactoryDependency } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { PublisherService } from './publishers';
import { ConsumerService } from './consumers';
import { RabbitMQHelperService } from './rabbitmq-helper.service';
import { RabbitMQModuleOptions } from './interfaces';

@Global()
@Module({})
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'RABBITMQ_OPTIONS',
        useValue: options,
      },
      RabbitMQService,
      PublisherService,
      ConsumerService,
      RabbitMQHelperService,
    ];

    return {
      module: RabbitMQModule,
      providers,
      exports: [RabbitMQService, PublisherService, ConsumerService, RabbitMQHelperService],
      global: options.isGlobal !== false,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: unknown[]) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
    inject?: unknown[];
    imports?: unknown[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'RABBITMQ_OPTIONS',
        useFactory: options.useFactory,
        inject: (options.inject as (InjectionToken | OptionalFactoryDependency)[]) ?? [],
      },
      RabbitMQService,
      PublisherService,
      ConsumerService,
      RabbitMQHelperService,
    ];

    return {
      module: RabbitMQModule,
      imports: (options.imports as (Type<unknown> | DynamicModule | ForwardReference<unknown> | Promise<DynamicModule>)[]) ?? [],
      providers,
      exports: [RabbitMQService, PublisherService, ConsumerService, RabbitMQHelperService],
      global: true,
    };
  }

  static createConnectionConfig(config: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
  }): RabbitMQModuleOptions {
    return {
      connection: {
        host: config.host ?? process.env['RABBITMQ_HOST'] ?? 'localhost',
        port: config.port ?? parseInt(process.env['RABBITMQ_PORT'] ?? '5672'),
        username: config.username ?? process.env['RABBITMQ_USERNAME'] ?? 'admin',
        password: config.password ?? process.env['RABBITMQ_PASSWORD'] ?? 'admin123',
        vhost: config.vhost ?? process.env['RABBITMQ_VHOST'] ?? '/',
        protocol: 'amqp',
        heartbeat: 60,
        connectionTimeout: 10000,
      },
      prefetchCount: 10,
      isGlobal: true,
    };
  }
}
