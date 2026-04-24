import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { HttpCreatePostDto } from '../../posts/api/dto/HttpCreatePost.dto';

export const BlogPostDtoExtractor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const plain = {
      ...request.body,
      ...request.params,
    };
    return plainToInstance(HttpCreatePostDto, plain);
  },
);
