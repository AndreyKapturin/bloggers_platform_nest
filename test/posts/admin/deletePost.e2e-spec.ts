import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { SA_PostsTestHelper } from '../../utils/SA_PostsTestHelper';
import { faker } from '@faker-js/faker';

describe('delete post', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let sa_postsTestHelper: SA_PostsTestHelper;

  let blogId: string;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    sa_postsTestHelper = new SA_PostsTestHelper(app);

    const blog = await sa_blogsTestHelper.createRandomBlog();
    blogId = blog.id;
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    postId = post.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete post. Return NOT FOUND if blog not exist`, async () => {
    const notExistedBlogId = crypto.randomUUID();
    await sa_postsTestHelper.deletePost(notExistedBlogId, postId, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it(`shouldn't delete post. Return NOT FOUND if post not exist`, async () => {
    const notExistedPostId = faker.database.mongodbObjectId().toString();
    await sa_postsTestHelper.deletePost(blogId, notExistedPostId, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it(`shouldn't delete post. Return UNAUTHORIZED if not admin auth`, async () => {
    await sa_postsTestHelper.deletePost(blogId, postId, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should delete post if post exist, admin auth passed', async () => {
    await sa_postsTestHelper.deletePost(blogId, postId);
  });
});
