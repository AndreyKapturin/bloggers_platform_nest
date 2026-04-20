import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { InputCreatePostForBlogDto } from '../../src/modules/bloggers-platform/posts/dto/PostForBlog.input-create-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';

describe('create post for blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  let blogId: string;

  const inputPost: InputCreatePostForBlogDto = {
    title: 'Post 1 title',
    shortDescription: 'Post 1 short description',
    content: 'Post 1 content bla bla bla bla bla bla bla bla',
  };

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

  it(`should create post if input data is correct, blog exist, admin auth passed`, async () => {
    await request(app.getHttpServer())
      .post(`/blogs/${blogId}/posts`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(inputPost)
      .expect(HttpStatus.CREATED);
  });

  it(`shouldn't create post if not admin auth`, async () => {
    await request(app.getHttpServer())
      .post(`/blogs/${blogId}/posts`)
      .send(inputPost)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
