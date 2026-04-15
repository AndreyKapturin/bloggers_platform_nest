import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import request from 'supertest';
import { createBlog } from '../utils/createBlog';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';

describe('delete blog', () => {
  const inputCreateBlog: InputCreateBlogDto = {
    name: 'Blog name',
    description: 'Blog description',
    websiteUrl: 'https://blog1.io',
  };

  let app: INestApplication;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
  });

  beforeEach(async () => {
    const createBlogResponse = await createBlog(app, inputCreateBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should delete blog if blog exist and admin auth passed`, async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${blogId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't delete blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${blogId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
