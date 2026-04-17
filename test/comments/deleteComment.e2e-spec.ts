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
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import requset from 'supertest';

describe('delete comment', () => {
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

  const inputUser2: InputCreateUserDto = {
    login: 'User_02',
    email: 'user2@mail.ru',
    password: 'Strong_password123',
  };

  const inputLogin: InputLoginDto = {
    loginOrEmail: inputUser.login,
    password: inputUser.password,
  };

  const inputLogin2: InputLoginDto = {
    loginOrEmail: inputUser2.login,
    password: inputUser2.password,
  };

  let inputCreatePostDto: InputCreatePostDto;

  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let commentsTestHelper: CommentsTestHelper;
  let authTestHelper: AuthTestHelper;

  let blogId: string;
  let postId: string;
  let accessToken: string;
  let accessToken2: string;
  let comment: ViewCommentDto;

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

    await usersTestHelper.createUser(inputUser2);
    const loginUserResponse2 = await authTestHelper.loginUser(inputLogin2);
    accessToken2 = loginUserResponse2.body.accessToken;

    const createCommentResponse = await commentsTestHelper.createComment(
      postId,
      accessToken,
      { content: 'Post 1 comment text text text' },
    );
    comment = createCommentResponse.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete comment. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await requset(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .auth(invalidAccessToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't delete comment. Return FORBIDDEN status if comment not belong to user`, async () => {
    await requset(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .auth(accessToken2, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it(`shouldn't delete comment. Return NOF FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();
    await requset(app.getHttpServer())
      .delete(`/comments/${notExistCommentId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete comment return NO CONTENT status if comment exist, access token valid, comment belong to user', async () => {
    await requset(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await requset(app.getHttpServer())
      .get(`/comments/${comment.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
