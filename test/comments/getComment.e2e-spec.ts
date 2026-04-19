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
import { LikeStatus } from '../../src/modules/bloggers-platform/comments/api/dto/HttpLikeComment.dto';

describe('get comment by id', () => {
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

  const inputComment = {
    content: 'Post 1 comment content',
  };

  const expectedComment: ViewCommentDto = {
    id: expect.any(String),
    content: inputComment.content,
    commentatorInfo: {
      userId: expect.any(String),
      userLogin: expect.any(String),
    },
    createdAt: expect.any(String),
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    },
  };

  let inputCreatePostDto: InputCreatePostDto;

  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let commentsTestHelper: CommentsTestHelper;
  let authTestHelper: AuthTestHelper;

  let blogId: string;
  let postId: string;
  let commentId: string;
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

    const createCommentResponse = await commentsTestHelper.createComment(
      postId,
      accessToken,
      inputComment,
    );
    commentId = createCommentResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return view comment if comment exist', async () => {
    const getCommentResponse =
      await commentsTestHelper.getCommentById(commentId);
    expect(getCommentResponse.body).toEqual(expectedComment);
  });

  it(`should return NOT FOUND status if comment not exist`, async () => {
    const unexistedCommentId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.getCommentById(unexistedCommentId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
