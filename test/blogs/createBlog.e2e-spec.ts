import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import request from 'supertest';
import { DB_BLOG_CONSTRAINTS } from '../../src/modules/bloggers-platform/blogs/domain/blog.entity';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';

describe('create blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create blog. Return view blog. if input data is correct and admin auth`, async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    const creacteBlogResponse = await blogsTestHelper.createBlog(inputBlog);

    const expectedBlog = blogsTestHelper.createExpectedBlog({
      name: inputBlog.name,
      description: inputBlog.description,
      websiteUrl: inputBlog.websiteUrl,
    });

    expect(creacteBlogResponse.body).toEqual(expectedBlog);
  });

  it('should return BAD REQUEST if name is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = '';
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = 'a'.repeat(DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH + 1);
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = '';
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = 'a'.repeat(
      DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH + 1,
    );
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = '';
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl =
      'https://' + 'a'.repeat(DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH + 1);
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl does not use https protocol', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'http://example.com';
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is not valid URL', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'not-a-valid-url';
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name field is missing', async () => {
    const { name, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.createBlog(inputBlog as HttpCreateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description field is missing', async () => {
    const { description, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.createBlog(inputBlog as HttpCreateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl field is missing', async () => {
    const { websiteUrl, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.createBlog(inputBlog as HttpCreateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = ' '.repeat(5);
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = ' '.repeat(5);
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = ' '.repeat(5);
    await blogsTestHelper.createBlog(inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't create blog if not admin auth`, async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    await request(app.getHttpServer())
      .post('/blogs')
      .send(inputBlog)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
