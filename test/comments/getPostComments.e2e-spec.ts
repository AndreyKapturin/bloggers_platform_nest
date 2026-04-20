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

describe('get post comments', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let postId: string;
  let accessToken: string;

  const commentsCount = 50;

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

    await commentsTestHelper.createRandomComments(
      commentsCount,
      postId,
      accessToken,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view comments for post if post exist', async () => {
    const expectedComments = commentsTestHelper.createExpectedComments();
    const getPostCommentsResponse =
      await commentsTestHelper.getPostComments(postId);
    expect(getPostCommentsResponse.body).toEqual(expectedComments);
    expect(getPostCommentsResponse.body.totalCount).toEqual(commentsCount);
  });

  it(`should return NOT FOUND status if post not exist`, async () => {
    const unexistedCommentId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.getPostComments(unexistedCommentId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
