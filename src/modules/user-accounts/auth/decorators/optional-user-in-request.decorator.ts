import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInRequest } from '../dto/UserInRequest.dto';

export const OptionalUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserInRequest | null => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
