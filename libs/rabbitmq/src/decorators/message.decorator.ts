import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RabbitMQMessage } from '../interfaces';

export const Message = createParamDecorator(
  (data: string, ctx: ExecutionContext): RabbitMQMessage => {
    const message = ctx.switchToRpc().getData();
    return data ? message?.[data] : message;
  }
);

export const MessageData = createParamDecorator(
  (data: string, ctx: ExecutionContext): any => {
    const message = ctx.switchToRpc().getData();
    return data ? message?.data?.[data] : message?.data;
  }
);

export const MessageHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext): Record<string, any> => {
    const message = ctx.switchToRpc().getData();
    return data ? message?.headers?.[data] : message?.headers;
  }
);

export const MessageId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const message = ctx.switchToRpc().getData();
    return message?.id;
  }
);

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const message = ctx.switchToRpc().getData();
    return message?.correlationId;
  }
);

export const MessageTimestamp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Date => {
    const message = ctx.switchToRpc().getData();
    return message?.timestamp;
  }
);