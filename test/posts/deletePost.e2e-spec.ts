import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { faker } from '@faker-js/faker';

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

  it(`shouldn't delete post. Return NOT FOUND if post not exist`, async () => {
    const notExistedPostId = faker.database.mongodbObjectId().toString();
    await postsTestHelper.deletePost(notExistedPostId, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it(`shouldn't delete post. Return UNAUTHORIZED if not admin auth`, async () => {
    await postsTestHelper.deletePost(postId, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should delete post if post exist, admin auth passed', async () => {
    await postsTestHelper.deletePost(postId);
  });
});
