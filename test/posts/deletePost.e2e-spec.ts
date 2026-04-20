import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('delete post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    const blog = await blogsTestHelper.createRandomBlog();

    const post = await postsTestHelper.createRandomPost(blog.id);
    postId = post.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete post if post exist, admin auth passed', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't delete post if not admin auth`, async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
