import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import { createBlog } from '../utils/createBlog';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { createPost } from '../utils/createPost';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { InputLoginDto } from '../../src/modules/user-accounts/auth/dto/Login.input-dto';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';

describe('create comment', () => {
  const inputBlog: InputCreateBlogDto = {
    name: 'Blog name',
    description: 'Blog description',
    websiteUrl: 'https://blog1.io',
  };

  const inputUser: InputCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'Strong_password123',
  };

  const inputLogin: InputLoginDto = {
    loginOrEmail: inputUser.login,
    password: inputUser.password,
  };

  let inputCreatePostDto: InputCreatePostDto;

  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let commentsTestHelper: CommentsTestHelper;
  let authTestHelper: AuthTestHelper;

  let blogId: string;
  let postId: string;
  let accessToken: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app);
    commentsTestHelper = new CommentsTestHelper(app);

    const createBlogResponse = await createBlog(app, inputBlog);
    blogId = createBlogResponse.body.id;
    inputCreatePostDto = {
      title: 'Post 1 title',
      shortDescription: 'Post 1 short description',
      content: 'Post 1 content content content',
      blogId,
    };

    const createPostResponse = await createPost(app, inputCreatePostDto);
    postId = createPostResponse.body.id;

    await usersTestHelper.createUser(inputUser);
    const loginUserResponse = await authTestHelper.loginUser(inputLogin);
    accessToken = loginUserResponse.body.accessToken;
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
