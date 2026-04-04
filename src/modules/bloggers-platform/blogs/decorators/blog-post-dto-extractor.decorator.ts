import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BlogPostDtoExtractor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...request.body,
      ...request.params,
    };
  },
);
