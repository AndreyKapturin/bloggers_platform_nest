import { INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import {
  DEFAULT_PAGE_SIZE,
  SortDirection,
} from '../../src/core/dto/BaseQueryParams.dto';
import { PostsSortBy } from '../../src/modules/bloggers-platform/posts/api/dto/PostQueryParams.dto';

describe('get posts', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  let blog: ViewBlogDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    blog = await blogsTestHelper.createRandomBlog();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view posts', async () => {
    const totalPostsCount = 3;

    for (let i = 0; i < totalPostsCount; i++) {
      await postsTestHelper.createBlogPost(
        blog.id,
        postsTestHelper.createBlogPostInputDto(),
      );
    }

    const response = await postsTestHelper.getPosts();

    expect(response.body).toEqual({
      pagesCount: Math.ceil(totalPostsCount / DEFAULT_PAGE_SIZE),
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: totalPostsCount,
      items: expect.arrayContaining([postsTestHelper.createExpectedPost()]),
    });
  });

  it('should respect pageNumber and pageSize query params', async () => {
    const pageNumber = 2;
    const pageSize = 5;
    const totalPostsCount = 11;

    for (let i = 0; i < totalPostsCount; i++) {
      await postsTestHelper.createBlogPost(
        blog.id,
        postsTestHelper.createBlogPostInputDto(),
      );
    }

    const response = await postsTestHelper.getPosts({
      filter: {
        pageNumber,
        pageSize,
      },
    });

    expect(response.body.page).toBe(pageNumber);
    expect(response.body.pageSize).toBe(pageSize);
    expect(response.body.items).toHaveLength(pageSize);
  });

  it('should support sorting by title asc and desc', async () => {
    const uniq = `post-title-${Date.now().toString().slice(-5)}`;
    const titles = [`${uniq}-a`, `${uniq}-c`, `${uniq}-b`];

    for (const title of titles) {
      const dto = postsTestHelper.createBlogPostInputDto();
      dto.title = title;
      await postsTestHelper.createBlogPost(blog.id, dto);
    }

    const getAscSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.Title,
        sortDirection: SortDirection.Asc,
      },
    });

    let titlesFormResponse = getAscSortedPostsResponse.body.items
      .filter((item) => item.title.startsWith(uniq))
      .map((item) => item.title);

    let expectedTitles = [`${uniq}-a`, `${uniq}-b`, `${uniq}-c`];
    expect(titlesFormResponse).toEqual(expectedTitles);

    const getDescSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.Title,
      },
    });

    titlesFormResponse = getDescSortedPostsResponse.body.items
      .filter((item) => item.title.startsWith(uniq))
      .map((item) => item.title);
    expectedTitles = [`${uniq}-c`, `${uniq}-b`, `${uniq}-a`];

    expect(titlesFormResponse).toEqual(expectedTitles);
  });

  it('should support sorting by blogName asc and desc', async () => {
    const uniq = `bn${Date.now().toString().slice(-3)}`;
    const blogNames = [`${uniq}a`, `${uniq}c`, `${uniq}b`];

    for (const blogName of blogNames) {
      const blogDto = blogsTestHelper.createInputDto();
      blogDto.name = blogName;

      const createdBlogResponse = await blogsTestHelper.createBlog(blogDto);
      await postsTestHelper.createBlogPost(
        createdBlogResponse.body.id,
        postsTestHelper.createBlogPostInputDto(),
      );
    }

    const getAscSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.BlogName,
        sortDirection: SortDirection.Asc,
      },
    });

    let titlesFromResponse = getAscSortedPostsResponse.body.items
      .filter((item) => item.blogName.startsWith(uniq))
      .map((item) => item.blogName);

    let expectedTitles = [`${uniq}a`, `${uniq}b`, `${uniq}c`];
    expect(titlesFromResponse).toEqual(expectedTitles);

    const getDescSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.BlogName,
      },
    });

    titlesFromResponse = getDescSortedPostsResponse.body.items
      .filter((item) => item.blogName.startsWith(uniq))
      .map((item) => item.blogName);

    expectedTitles = [`${uniq}c`, `${uniq}b`, `${uniq}a`];
    expect(titlesFromResponse).toEqual(expectedTitles);
  });

  it('should support sorting by createdAt asc and desc', async () => {
    const uniq = `created-at-${Date.now().toString().slice(-5)}`;
    const firstTitle = `${uniq}-first`;
    const secondTitle = `${uniq}-second`;

    await postsTestHelper.createBlogPost(blog.id, {
      ...postsTestHelper.createBlogPostInputDto(),
      title: firstTitle,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await postsTestHelper.createBlogPost(blog.id, {
      ...postsTestHelper.createBlogPostInputDto(),
      title: secondTitle,
    });

    const getAscSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.CreatedAt,
        sortDirection: SortDirection.Asc,
      },
    });

    let titlesFromResponse = getAscSortedPostsResponse.body.items
      .filter((item) => item.title.startsWith(uniq))
      .map((item) => item.title);

    let expectedTitles = [firstTitle, secondTitle];

    expect(titlesFromResponse).toEqual(expectedTitles);

    const getDescSortedPostsResponse = await postsTestHelper.getPosts({
      filter: {
        sortBy: PostsSortBy.CreatedAt,
      },
    });

    titlesFromResponse = getDescSortedPostsResponse.body.items
      .filter((item) => item.title.startsWith(uniq))
      .map((item) => item.title);

    expectedTitles = [secondTitle, firstTitle];
    expect(titlesFromResponse).toEqual(expectedTitles);
  });
});
