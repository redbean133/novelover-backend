import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithUser } from '../interface/IRequestWithUser';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    return request.user?.sub ?? null;
  },
);
