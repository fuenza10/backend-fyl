import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { users } from '@prisma/client';

export const CurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  users
>((_, ctx) => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
});
