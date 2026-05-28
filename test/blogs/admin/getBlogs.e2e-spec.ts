import { INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import {
  DEFAULT_PAGE_SIZE,
  SortDirection,
} from '../../../src/core/dto/BaseQueryParams.dto';
import { BlogsSortBy } from '../../../src/modules/bloggers-platform/blogs/api/dto/BlogQueryParams.dto';

describe('get blogs for admin', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  const totalBlogsCount = 50;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    await sa_blogsTestHelper.createRandomBlogs(totalBlogsCount);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view blogs', async () => {
    const getBlogsResponse = await sa_blogsTestHelper.getBlogsWithQuery();
    const expectedBlogs = {
      pagesCount: Math.ceil(totalBlogsCount / DEFAULT_PAGE_SIZE),
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: totalBlogsCount,
      items: expect.arrayContaining([sa_blogsTestHelper.createExpectedBlog()]),
    };
    expect(getBlogsResponse.body).toEqual(expectedBlogs);
  });

  it('should respect pageNumber and pageSize query params', async () => {
    const pageNumber = 2;
    const pageSize = 5;

    const response = await sa_blogsTestHelper.getBlogsWithQuery({
      filter: {
        pageNumber,
        pageSize,
      },
    });

    expect(response.body.page).toBe(pageNumber);
    expect(response.body.pageSize).toBe(pageSize);
    expect(response.body.items).toHaveLength(pageSize);
  });

  it('should filter by searchNameTerm and sort by name asc/desc', async () => {
    const uniq = `s${Date.now().toString().slice(-4)}`;
    const names = [`${uniq} c`, `${uniq} a`, `${uniq} b`];

    for (const name of names) {
      await sa_blogsTestHelper.createBlog({
        name,
        description: 'desc',
        websiteUrl: 'https://example.com',
      });
    }

    const getAscSortResponse = await sa_blogsTestHelper.getBlogsWithQuery({
      filter: {
        searchNameTerm: uniq,
        sortBy: BlogsSortBy.Name,
        sortDirection: SortDirection.Asc,
      },
    });

    expect(getAscSortResponse.body.totalCount).toBe(3);
    expect(getAscSortResponse.body.items.map((b) => b.name)).toEqual([
      `${uniq} a`,
      `${uniq} b`,
      `${uniq} c`,
    ]);

    const getDescResponse = await sa_blogsTestHelper.getBlogsWithQuery({
      filter: {
        searchNameTerm: uniq,
        sortBy: BlogsSortBy.Name,
      },
    });

    expect(getDescResponse.body.items.map((b) => b.name)).toEqual([
      `${uniq} c`,
      `${uniq} b`,
      `${uniq} a`,
    ]);
  });

  it('should sort by createdAt asc/desc when requested', async () => {
    const uniq = `t${Date.now().toString().slice(-4)}`;
    const first = `${uniq}-first`;
    const second = `${uniq}-second`;

    await sa_blogsTestHelper.createBlog({
      name: first,
      description: 'desc',
      websiteUrl: 'https://example.com',
    });

    await new Promise((r) => setTimeout(r, 10));

    await sa_blogsTestHelper.createBlog({
      name: second,
      description: 'desc',
      websiteUrl: 'https://example.com',
    });

    const getAscSortResponse = await sa_blogsTestHelper.getBlogsWithQuery({
      filter: {
        searchNameTerm: uniq,
        sortBy: BlogsSortBy.CreatedAt,
        sortDirection: SortDirection.Asc,
      },
    });

    expect(getAscSortResponse.body.items.map((b) => b.name)).toEqual([
      first,
      second,
    ]);

    const getDescSortResponse = await sa_blogsTestHelper.getBlogsWithQuery({
      filter: {
        searchNameTerm: uniq,
        sortBy: BlogsSortBy.CreatedAt,
        sortDirection: SortDirection.Desc,
      },
    });

    expect(getDescSortResponse.body.items.map((b) => b.name)).toEqual([
      second,
      first,
    ]);
  });
});
