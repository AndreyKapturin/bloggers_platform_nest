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
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import { ViewUserDto } from '../../src/modules/user-accounts/users/api/dto/ViewUser.dto';
import { InputLoginDto } from '../../src/modules/user-accounts/auth/dto/Login.input-dto';

describe('get comment by id', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let comment: ViewCommentDto;
  let user: ViewUserDto;
  let accessToken: string;

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

    const inputUser = usersTestHelper.createInputDto();
    const createUserResponse = await usersTestHelper.createUser(inputUser);
    user = createUserResponse.body;
    const inputLogin: InputLoginDto = {
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    };
    accessToken = await authTestHelper.loginAndGetAccessToken(inputLogin);

    comment = await commentsTestHelper.createRandomComment(
      post.id,
      accessToken,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return view comment if comment exist', async () => {
    const expectedBody = commentsTestHelper.createExpectedComment({
      content: comment.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    });
    const getCommentResponse = await commentsTestHelper.getCommentById(
      comment.id,
    );
    expect(getCommentResponse.body).toEqual(expectedBody);
  });

  it(`should return NOT FOUND status if comment not exist`, async () => {
    const unexistedCommentId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.getCommentById(unexistedCommentId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
