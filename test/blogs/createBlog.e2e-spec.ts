import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import request from 'supertest';
import { createBlog } from '../utils/createBlog';

describe('create blog', () => {
  const inputBlog: InputCreateBlogDto = {
    name: 'Blog name',
    description: 'Blog description',
    websiteUrl: 'https://blog1.io',
  };

  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create blog if input data is correct and admin auth`, async () => {
    await createBlog(app, inputBlog);
  });

  it(`shouldn't create blog if not admin auth`, async () => {
    await request(app.getHttpServer())
      .post('/blogs')
      .send(inputBlog)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
