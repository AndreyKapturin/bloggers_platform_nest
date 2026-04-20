import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('create comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let accessToken: string;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    commentsTestHelper = new CommentsTestHelper(app);

    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);
    postId = post.id;
    accessToken = await authTestHelper.createUserAndGetAccessToken();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create comment if data is valid, post exist, access token valid', async () => {
    await commentsTestHelper.createComment(postId, accessToken, {
      content: 'Post 1 comment text text text',
    });
  });

  it(`shouldn't create comment. Return BAD REQUSET status if data is invalid`, async () => {
    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 'short content' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create comment. Return UNAUTHORIZED status if access token invalid`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await commentsTestHelper.createComment(
      postId,
      invalidAccessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.UNAUTHORIZED },
    );
  });

  it(`shouldn't create comment. Return NOT FOUND status if post not exist`, async () => {
    const unexistedPostId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.createComment(
      unexistedPostId,
      accessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.NOT_FOUND },
    );
  });
});
