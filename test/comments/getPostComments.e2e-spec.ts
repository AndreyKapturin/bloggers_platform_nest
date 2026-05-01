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
import { SortDirection } from '../../src/core/dto/BaseQueryParams.dto';
import { CommentsSortBy } from '../../src/modules/bloggers-platform/comments/api/dto/CommentsQueryParams.dto';
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';

describe('get post comments', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let commentsTestHelper: CommentsTestHelper;

  let createdComments: ViewCommentDto[];

  let postId: string;
  let accessToken: string;

  const commentsCount = 50;

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

    createdComments = await commentsTestHelper.createRandomComments(
      commentsCount,
      postId,
      accessToken,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view comments for post if post exist', async () => {
    const expectedComments = commentsTestHelper.createExpectedComments();
    const getPostCommentsResponse =
      await commentsTestHelper.getPostComments(postId);
    expect(getPostCommentsResponse.body).toEqual(expectedComments);
    expect(getPostCommentsResponse.body.totalCount).toEqual(commentsCount);
  });

  it('should respect pageNumber and pageSize query params', async () => {
    const pageNumber = 2;
    const pageSize = 10;

    const response = await commentsTestHelper.getPostComments(postId, {
      filter: { pageNumber, pageSize },
    });

    expect(response.body.page).toBe(pageNumber);
    expect(response.body.pageSize).toBe(pageSize);
    expect(response.body.items).toHaveLength(pageSize);
    expect(response.body.totalCount).toBe(commentsCount);

    const descending = [...createdComments].reverse();
    const start = (pageNumber - 1) * pageSize;
    const expectedPageItems = descending.slice(start, start + pageSize);
    const expectedIds = expectedPageItems.map((c) => c.id);
    const responseIds = response.body.items.map((c) => c.id);
    expect(responseIds).toEqual(expectedIds);
  });

  it('should support sorting by createdAt asc and desc', async () => {
    const ascResponse = await commentsTestHelper.getPostComments(postId, {
      filter: {
        sortBy: CommentsSortBy.CreatedAt,
        sortDirection: SortDirection.Asc,
        pageSize: commentsCount,
      },
    });

    expect(ascResponse.body.items[0].id).toBe(createdComments[0].id);
    expect(ascResponse.body.items[1].id).toBe(createdComments[1].id);
    expect(ascResponse.body.items[2].id).toBe(createdComments[2].id);

    const descResponse = await commentsTestHelper.getPostComments(postId, {
      filter: {
        sortBy: CommentsSortBy.CreatedAt,
        sortDirection: SortDirection.Desc,
        pageSize: commentsCount,
      },
    });

    expect(descResponse.body.items[0].id).toBe(createdComments.at(-1)!.id);
    expect(descResponse.body.items[1].id).toBe(createdComments.at(-2)!.id);
    expect(descResponse.body.items[2].id).toBe(createdComments.at(-3)!.id);
  });

  it(`should return NOT FOUND status if post not exist`, async () => {
    const unexistedCommentId = faker.database.mongodbObjectId().toString();
    await commentsTestHelper.getPostComments(unexistedCommentId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
