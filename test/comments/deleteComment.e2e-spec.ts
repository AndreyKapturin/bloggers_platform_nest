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
import { JwtService } from '@nestjs/jwt';
import {
  JWT_AT_SECRET,
  JWT_AT_SERVICE,
  JWT_AT_TTL,
} from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';

describe('delete comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let postId: string;
  let commentId: string;

  let accessToken: string;
  let accessToken2: string;

  const jwtService = new JwtService({
    secret: JWT_AT_SECRET,
    signOptions: { expiresIn: JWT_AT_TTL },
  });

  const originalJwtSignAsync = jwtService.signAsync.bind(jwtService);
  const jwtSignAsyncMock = jest.spyOn(jwtService, 'signAsync');

  beforeAll(async () => {
    app = await initApp((builder) => {
      builder.overrideProvider(JWT_AT_SERVICE).useValue(jwtService);
    });
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
    accessToken2 = await authTestHelper.createUserAndGetAccessToken();

    const comment = await commentsTestHelper.createRandomComment(
      postId,
      accessToken,
    );
    commentId = comment.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete comment. Return UNAUTHORIZED status if access token expired`, async () => {
    jwtSignAsyncMock.mockImplementationOnce(async (payload, options) => {
      return originalJwtSignAsync(payload, { ...options, expiresIn: '1s' });
    });

    const accessToken = await authTestHelper.createUserAndGetAccessToken();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await commentsTestHelper.deleteComment(commentId, accessToken, {
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't delete comment. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await commentsTestHelper.deleteComment(commentId, invalidAccessToken, {
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't delete comment. Return FORBIDDEN status if comment not belong to user`, async () => {
    await commentsTestHelper.deleteComment(commentId, accessToken2, {
      status: HttpStatus.FORBIDDEN,
    });
  });

  it(`shouldn't delete comment. Return NOT FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.deleteComment(notExistCommentId, accessToken, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should delete comment return NO CONTENT status if comment exist, access token valid, comment belong to user', async () => {
    await commentsTestHelper.deleteComment(commentId, accessToken, {
      status: HttpStatus.NO_CONTENT,
    });
    await commentsTestHelper.getCommentById(commentId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
