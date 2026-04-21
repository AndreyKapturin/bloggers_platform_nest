import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import {
  HttpLikeStatusDto,
  LikeStatus,
} from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { faker } from '@faker-js/faker';

describe('like post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  const inputLike = { likeStatus: LikeStatus.Like };
  const inputDislike = { likeStatus: LikeStatus.Dislike };
  const inputNone = { likeStatus: LikeStatus.None };
  const inputWrongStatus = {
    likeStatus: 'Wrong status',
  } as unknown as HttpLikeStatusDto;

  const expectedNewestLike = {
    userId: expect.any(String),
    login: expect.any(String),
    addedAt: expect.any(String),
  };

  let postId: string;
  let accessToken1: string;
  let accessToken2: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);
    postId = post.id;

    accessToken1 = await authTestHelper.createUserAndGetAccessToken();
    accessToken2 = await authTestHelper.createUserAndGetAccessToken();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add like to post return NO CONTENT status if data is valid, post exist, access token valid', async () => {
    await postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: accessToken1,
    });
    const postAfterLikeResponse = await postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterLikeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postAfterLikeResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(postAfterLikeResponse.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );
    expect(postAfterLikeResponse.body.extendedLikesInfo.newestLikes).toEqual([
      expectedNewestLike,
    ]);
  });

  it(`myStatus should be ${LikeStatus.None} if like was added by another user`, async () => {
    const getResponseForAnotherUser = await postsTestHelper.getPost(postId, {
      accessToken: accessToken2,
    });
    expect(getResponseForAnotherUser.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.None,
    );
    expect(getResponseForAnotherUser.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`myStatus should be ${LikeStatus.None} if get request was sent from anonymous user`, async () => {
    const postResponse = await postsTestHelper.getPost(postId);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it('should change status', async () => {
    await postsTestHelper.setLikeStatus(postId, inputDislike, {
      accessToken: accessToken1,
    });

    const postAfterDislike = await postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterDislike.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterDislike.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postAfterDislike.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    await postsTestHelper.setLikeStatus(postId, inputNone, {
      accessToken: accessToken1,
    });

    const postAfterNone = await postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterNone.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should track multiple users reactions independently', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await postsTestHelper.setLikeStatus(post.id, inputDislike, {
      accessToken: accessToken2,
    });

    let postResponse = await postsTestHelper.getPost(post.id, {
      accessToken: accessToken1,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    postResponse = await postsTestHelper.getPost(post.id, {
      accessToken: accessToken2,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should correctly count likes when user removes reaction', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken2,
    });

    let postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(2);

    await postsTestHelper.setLikeStatus(post.id, inputNone, {
      accessToken: accessToken1,
    });

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`shouldn't set like to post. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: invalidAccessToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't set wrong status to post. Return BAD REQUEST status`, async () => {
    await postsTestHelper.setLikeStatus(postId, inputWrongStatus, {
      accessToken: accessToken1,
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't set like to post. Return NOT FOUND status if post not exist`, async () => {
    const notExistPostId = faker.database.mongodbObjectId().toString();
    await postsTestHelper.setLikeStatus(notExistPostId, inputLike, {
      accessToken: accessToken1,
      status: HttpStatus.NOT_FOUND,
    });
  });
});
