import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import request from 'supertest';

describe('create blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create blog if input data is correct and admin auth`, async () => {
    await blogsTestHelper.createRandomBlog();
  });

  it(`shouldn't create blog if not admin auth`, async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    await request(app.getHttpServer())
      .post('/blogs')
      .send(inputBlog)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
