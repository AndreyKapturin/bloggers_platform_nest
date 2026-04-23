import { INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { DEFAULT_PAGE_SIZE } from '../../src/core/dto/BaseQueryParams.dto';

describe('get blogs', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  const totalBlogsCount = 50;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    await blogsTestHelper.createRandomBlogs(totalBlogsCount);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view blogs', async () => {
    const getBlogsResponse = await blogsTestHelper.getBlogsWithQuery();
    const expectedBlogs = {
      pagesCount: Math.ceil(totalBlogsCount / DEFAULT_PAGE_SIZE),
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: totalBlogsCount,
      items: expect.arrayContaining([blogsTestHelper.createExpectedBlog()]),
    };
    expect(getBlogsResponse.body).toEqual(expectedBlogs);
  });
});
