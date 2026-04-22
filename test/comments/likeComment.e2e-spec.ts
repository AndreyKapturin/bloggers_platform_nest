import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { LikeStatus } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('like comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  const inputLike = { likeStatus: LikeStatus.Like };
  const inputDislike = { likeStatus: LikeStatus.Dislike };
  const inputNone = { likeStatus: LikeStatus.None };
  const inputWrongStatus = { likeStatus: 'Wrong status' };

  let user1AccessToken: string;
  let user2AccessToken: string;
  let commentId: string;

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

    user1AccessToken = await authTestHelper.createUserAndGetAccessToken();
    user2AccessToken = await authTestHelper.createUserAndGetAccessToken();

    const comment = await commentsTestHelper.createRandomComment(
      post.id,
      user1AccessToken,
    );
    commentId = comment.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add like to comment return NO CONTENT status if data is valid, comment exist, access token valid', async () => {
    await commentsTestHelper.setLikeStatus(
      commentId,
      inputLike,
      user1AccessToken,
    );
    const getAfterLikeResponse = await commentsTestHelper.getCommentById(
      commentId,
      { accessToken: user1AccessToken },
    );
    expect(getAfterLikeResponse.body.likesInfo.likesCount).toBe(1);
    expect(getAfterLikeResponse.body.likesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it(`myStatus should be ${LikeStatus.None} if like was added another user`, async () => {
    const getForAnotherUserResponse = await commentsTestHelper.getCommentById(
      commentId,
      { accessToken: user2AccessToken },
    );
    expect(getForAnotherUserResponse.body.likesInfo.myStatus).toBe(
      LikeStatus.None,
    );
  });

  it(`myStatus should be ${LikeStatus.None} if get request was send from anonymous user`, async () => {
    const getForAnonymousUserResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getForAnonymousUserResponse.body.likesInfo.myStatus).toBe(
      LikeStatus.None,
    );
  });

  it('should change like status. Return NO CONTENT status if data is valid, comment exist, access token valid', async () => {
    await commentsTestHelper.setLikeStatus(
      commentId,
      inputLike,
      user1AccessToken,
    );
    const getAfterLikeResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterLikeResponse.body.likesInfo.likesCount).toBe(1);
    expect(getAfterLikeResponse.body.likesInfo.dislikesCount).toBe(0);

    await commentsTestHelper.setLikeStatus(
      commentId,
      inputDislike,
      user1AccessToken,
    );
    const getAfterDislikeResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterDislikeResponse.body.likesInfo.likesCount).toBe(0);
    expect(getAfterDislikeResponse.body.likesInfo.dislikesCount).toBe(1);

    await commentsTestHelper.setLikeStatus(
      commentId,
      inputNone,
      user1AccessToken,
    );
    const getAfterNoneResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterNoneResponse.body.likesInfo.likesCount).toBe(0);
    expect(getAfterNoneResponse.body.likesInfo.dislikesCount).toBe(0);
  });

  it(`shouldn't set like to comment. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await commentsTestHelper.setLikeStatus(
      commentId,
      inputLike,
      invalidAccessToken,
      { status: HttpStatus.UNAUTHORIZED },
    );
  });

  it(`shouldn't set wrong status to comment. Return BAD REQUEST status`, async () => {
    await commentsTestHelper.setLikeStatus(
      commentId,
      inputWrongStatus,
      user1AccessToken,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't set like to comment. Return NOT FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();

    await commentsTestHelper.setLikeStatus(
      notExistCommentId,
      inputLike,
      user1AccessToken,
      { status: HttpStatus.NOT_FOUND },
    );
  });
});
