import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { HttpCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/HttpComment.dto';
import { COMMENT_CONTENT_CONSTRAINTS } from '../../src/modules/bloggers-platform/comments/domain/comment.entity';
import { overrideAccessTokenJwtService } from '../utils/overrideAccessTokenJwtService';

describe('update comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;
  let accessToken: string;
  let accessToken2: string;
  let comment: ViewCommentDto;

  beforeAll(async () => {
    app = await initApp((builder) => {
      overrideAccessTokenJwtService(builder);
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

    accessToken = await authTestHelper.createUserAndGetAccessToken();
    accessToken2 = await authTestHelper.createUserAndGetAccessToken();

    comment = await commentsTestHelper.createRandomComment(
      post.id,
      accessToken,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update comment. Return NO CONTENT status if data is valid, comment exist, access token valid, comment belong to user', async () => {
    const newContent = 'Post 1 comment updated text';

    await commentsTestHelper.updateComment(comment.id, accessToken, {
      content: newContent,
    });

    const getAfterUpdateResponse = await commentsTestHelper.getCommentById(
      comment.id,
    );

    expect(getAfterUpdateResponse.body.content).toBe(newContent);
  });

  it(`shouldn't update comment. Return BAD REQUSET status if content length less than min`, async () => {
    await commentsTestHelper.updateComment(
      comment.id,
      accessToken,
      { content: 'a'.repeat(COMMENT_CONTENT_CONSTRAINTS.MIN_LENGTH - 1) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update comment. Return BAD REQUSET status if content length great than max`, async () => {
    await commentsTestHelper.updateComment(
      comment.id,
      accessToken,
      { content: 'a'.repeat(COMMENT_CONTENT_CONSTRAINTS.MAX_LENGTH + 1) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update comment. Return BAD REQUSET status if content is a string of spaces`, async () => {
    await commentsTestHelper.updateComment(
      comment.id,
      accessToken,
      { content: ' '.repeat(10) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update comment. Return BAD REQUSET status if content not a string`, async () => {
    await commentsTestHelper.updateComment(
      comment.id,
      accessToken,
      { content: 10 } as unknown as HttpCommentDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update comment. Return UNAUTHORIZED status if access token invalid`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await commentsTestHelper.updateComment(
      comment.id,
      invalidAccessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.UNAUTHORIZED },
    );
  });

  it(`shouldn't update comment. Return FORBIDDEN status if comment not belong to user`, async () => {
    await commentsTestHelper.updateComment(
      comment.id,
      accessToken2,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.FORBIDDEN },
    );
  });

  it(`shouldn't update comment. Return NOF FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();

    await commentsTestHelper.updateComment(
      notExistCommentId,
      accessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.NOT_FOUND },
    );
  });

  it(`shouldn't update comment. Return UNAUTHORIZED status if access token expired`, async () => {
    const accessToken = await authTestHelper.createUserAndGetAccessToken();

    await new Promise((resolve) => setTimeout(resolve, 2100));

    await commentsTestHelper.updateComment(
      comment.id,
      accessToken,
      { content: 'Normal length content more than 20 symbols' },
      { status: HttpStatus.UNAUTHORIZED },
    );
  });
});
