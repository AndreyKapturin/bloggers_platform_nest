import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './Jwt.guard';

@Injectable()
export class JwtOptionalAuthGuard extends JwtAuthGuard {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (err || !user) {
      return null;
    } else {
      return user;
    }
  }
}
