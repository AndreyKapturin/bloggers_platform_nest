import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import requset from 'supertest';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('update comment', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  const newContent = 'Post 1 comment updated text';

  let accessToken: string;
  let accessToken2: string;
  let comment: ViewCommentDto;

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

  it('should update comment return NO CONTENT status if data is valid, comment exist, access token valid, comment belong to user', async () => {
    await requset(app.getHttpServer())
      .put(`/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ content: newContent })
      .expect(HttpStatus.NO_CONTENT);

    const getAfterUpdateResponse = await commentsTestHelper.getCommentById(
      comment.id,
    );

    expect(getAfterUpdateResponse.body.content).toBe(newContent);
  });

  it(`shouldn't update comment. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await requset(app.getHttpServer())
      .put(`/comments/${comment.id}`)
      .auth(invalidAccessToken, { type: 'bearer' })
      .send({ content: newContent })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't update comment. Return BAD REQUEST status if data is invalid`, async () => {
    const badContent = 'small content';
    await requset(app.getHttpServer())
      .put(`/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ content: badContent })
      .expect(HttpStatus.BAD_REQUEST);

    const getAfterUpdateResponse = await commentsTestHelper.getCommentById(
      comment.id,
    );

    expect(getAfterUpdateResponse.body.content).toBe(newContent);
  });

  it(`shouldn't update comment. Return FORBIDDEN status if comment not belong to user`, async () => {
    await requset(app.getHttpServer())
      .put(`/comments/${comment.id}`)
      .auth(accessToken2, { type: 'bearer' })
      .send({ content: newContent })
      .expect(HttpStatus.FORBIDDEN);
  });

  it(`shouldn't update comment. Return NOF FOUND status if comment not exist`, async () => {
    const notExistCommentId = faker.database.mongodbObjectId().toString();

    await requset(app.getHttpServer())
      .put(`/comments/${notExistCommentId}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ content: newContent })
      .expect(HttpStatus.NOT_FOUND);
  });
});
