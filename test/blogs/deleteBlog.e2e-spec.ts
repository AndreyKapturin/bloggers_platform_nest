import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { faker } from '@faker-js/faker';

// dependent tests
describe('delete blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    const blog = await blogsTestHelper.createRandomBlog();
    blogId = blog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${blogId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should delete blog if blog exist and admin auth passed', async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${blogId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't delete blog if blog not exist`, async () => {
    const notExistingBlogId = faker.database.mongodbObjectId().toString();
    await request(app.getHttpServer())
      .delete(`/blogs/${notExistingBlogId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NOT_FOUND);
  });
});
