import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RabbitMQMessage } from '../interfaces';

export const Message = createParamDecorator(
  (data: string, ctx: ExecutionContext): RabbitMQMessage => {
    const message = ctx.switchToRpc().getData();
    return data ? message?.[data] : message;
  },
);

export const MessageData = createParamDecorator((data: string, ctx: ExecutionContext): unknown => {
  const message = ctx.switchToRpc().getData();
  return data ? message?.data?.[data] : message?.data;
});

export const MessageHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext): Record<string, unknown> => {
    const message = ctx.switchToRpc().getData();
    return data ? message?.headers?.[data] : message?.headers;
  },
);

export const MessageId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const message = ctx.switchToRpc().getData();
  return message?.id;
});

export const CorrelationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const message = ctx.switchToRpc().getData();
    return message?.correlationId;
  },
);

export const MessageTimestamp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Date => {
    const message = ctx.switchToRpc().getData();
    return message?.timestamp;
  },
);
