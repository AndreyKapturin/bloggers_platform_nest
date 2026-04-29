import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInRequestDto } from '../dto/UserInRequest.dto'; 

export const OptionalUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserInRequestDto | null => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
