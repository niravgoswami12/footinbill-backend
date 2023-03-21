import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClient } from '../../../shared/utils/get-client';
// get current user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => getClient(ctx)?.user,
);
