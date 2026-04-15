import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';

export const createBlog = async (
  app: INestApplication,
  dto: InputCreateBlogDto,
) => {
  return await request(app.getHttpServer())
    .post('/blogs')
    .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
    .send(dto)
    .expect(HttpStatus.CREATED);
};
