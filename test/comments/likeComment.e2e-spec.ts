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
import { LikeStatus } from '../../src/modules/bloggers-platform/comments/api/dto/HttpLikeComment.dto';

describe('like comment', () => {
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

  const inputLike = { likeStatus: LikeStatus.Like };
  const inputDislike = { likeStatus: LikeStatus.Dislike };
  const inputNone = { likeStatus: LikeStatus.None };
  const inputWrongStatus = { likeStatus: 'Wrong status' };

  let inputCreatePostDto: InputCreatePostDto;

  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let commentsTestHelper: CommentsTestHelper;
  let authTestHelper: AuthTestHelper;

  let blogId: string;
  let postId: string;
  let accessToken: string;
  let accessToken2: string;
  let commentId: string;

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
    commentId = createCommentResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add like to comment return NO CONTENT status if data is valid, comment exist, access token valid', async () => {
    await commentsTestHelper.setLikeStatus(commentId, inputLike, accessToken);
    const getAfterLikeResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterLikeResponse.body.likesInfo.likesCount).toBe(1);
  });

  it('should change like status. Return NO CONTENT status if data is valid, comment exist, access token valid', async () => {
    await commentsTestHelper.setLikeStatus(commentId, inputLike, accessToken);
    const getAfterLikeResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterLikeResponse.body.likesInfo.likesCount).toBe(1);
    expect(getAfterLikeResponse.body.likesInfo.dislikesCount).toBe(0);

    await commentsTestHelper.setLikeStatus(commentId, inputDislike, accessToken);
    const getAfterDislikeResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getAfterDislikeResponse.body.likesInfo.likesCount).toBe(0);
    expect(getAfterDislikeResponse.body.likesInfo.dislikesCount).toBe(1);

    await commentsTestHelper.setLikeStatus(commentId, inputNone, accessToken);
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
      accessToken,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't set like to comment. Return NOT FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();

    await commentsTestHelper.setLikeStatus(
      notExistCommentId,
      inputLike,
      accessToken,
      { status: HttpStatus.NOT_FOUND },
    );
  });
});
