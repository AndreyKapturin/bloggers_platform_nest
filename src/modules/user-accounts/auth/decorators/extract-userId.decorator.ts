import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserInRequest } from "../dto/UserInRequest.dto";

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserInRequest => {
    const request = context.switchToHttp().getRequest();
 
    const user = request.user;
    
    if (!user) {
      throw new Error('"user" property has not be added into request');
    }
 
    return user;
  },
);