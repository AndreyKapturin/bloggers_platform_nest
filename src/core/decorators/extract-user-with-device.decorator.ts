import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserWithDeviceInRequestDto } from "../dto/UserInRequest.dto";

export const ExtractUserWithDeviceFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserWithDeviceInRequestDto => {
    const request = context.switchToHttp().getRequest();
 
    const user = request.user;
    
    if (!user) {
      throw new Error('"user" property has not be added into request');
    }
 
    return user;
  },
);