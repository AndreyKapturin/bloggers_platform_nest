import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';

export const createPost = async (app: INestApplication, dto: InputCreatePostDto) => {
  return await request(app.getHttpServer())
    .post('/posts')
    .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
    .send(dto)
    .expect(HttpStatus.CREATED);
};
