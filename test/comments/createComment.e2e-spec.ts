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
import { ViewUserDto } from '../../src/modules/user-accounts/users/api/dto/ViewUser.dto';
import { InputLoginDto } from '../../src/modules/user-accounts/auth/dto/Login.input-dto';
import { COMMENT_CONTENT_CONSTRAINTS } from '../../src/modules/bloggers-platform/comments/domain/comment.entity';
import { HttpCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/HttpComment.dto';
import {
  JWT_AT_SECRET,
  JWT_AT_SERVICE,
  JWT_AT_TTL,
} from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';
import { JwtService } from '@nestjs/jwt';

describe('create comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let user: ViewUserDto;
  let accessToken: string;
  let postId: string;

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

    const inputUser = usersTestHelper.createInputDto();
    const createUserResponse = await usersTestHelper.createUser(inputUser);
    user = createUserResponse.body;
    const inputLogin: InputLoginDto = {
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    };
    accessToken = await authTestHelper.loginAndGetAccessToken(inputLogin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create comment. Return view comment if data is valid, post exist, access token valid', async () => {
    const content = 'Post 1 comment text text text';
    const createCommentResponse = await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content },
    );

    const expectedBody = commentsTestHelper.createExpectedComment({
      content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    });

    expect(createCommentResponse.body).toEqual(expectedBody);
  });

  it(`shouldn't create comment. Return BAD REQUSET status if content length less than min`, async () => {
    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 'a'.repeat(COMMENT_CONTENT_CONSTRAINTS.MIN_LENGTH - 1) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create comment. Return BAD REQUSET status if content length great than max`, async () => {
    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 'a'.repeat(COMMENT_CONTENT_CONSTRAINTS.MAX_LENGTH + 1) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create comment. Return BAD REQUSET status if content is a string of spaces`, async () => {
    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: ' '.repeat(10) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create comment. Return BAD REQUSET status if content not a string`, async () => {
    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 10 } as unknown as HttpCommentDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create comment. Return UNAUTHORIZED status if access token expired`, async () => {
    jwtSignAsyncMock.mockImplementationOnce(async (payload, options) => {
      return originalJwtSignAsync(payload, { ...options, expiresIn: '1s' })
    });

    const accessToken = await authTestHelper.createUserAndGetAccessToken();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.UNAUTHORIZED },
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
