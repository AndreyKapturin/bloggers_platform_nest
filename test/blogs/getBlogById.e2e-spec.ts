import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { faker } from '@faker-js/faker';

describe('get blog by id', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let inputBlog: HttpCreateBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    inputBlog = blogsTestHelper.createInputDto();
    const createBlogResponse = await blogsTestHelper.createBlog(inputBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should return view blog if blog exist`, async () => {
    const getBlogResponse = await blogsTestHelper.getBlogById(blogId);
    const expectedBlog = blogsTestHelper.createExpectedBlog();
    expect(getBlogResponse.body).toEqual(expectedBlog);
  });

  it('should return NOT FOUND status if blog not exist', async () => {
    const unexistedBlogId = faker.database.mongodbObjectId().toString();
    await blogsTestHelper.getBlogById(unexistedBlogId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
