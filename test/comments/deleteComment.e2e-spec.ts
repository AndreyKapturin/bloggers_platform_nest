import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { CommentsTestHelper } from '../utils/CommentsTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import requset from 'supertest';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

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

  it(`shouldn't delete comment. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await requset(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .auth(invalidAccessToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't delete comment. Return FORBIDDEN status if comment not belong to user`, async () => {
    await requset(app.getHttpServer())
      .delete(`/comments/${commentId}`)
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
      .delete(`/comments/${commentId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await requset(app.getHttpServer())
      .get(`/comments/${commentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
