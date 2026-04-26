import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { HttpUpdateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpUpdateBlog.dto';
import { DB_BLOG_CONSTRAINTS } from '../../src/modules/bloggers-platform/blogs/domain/blog.entity';
import { faker } from '@faker-js/faker';

describe('update blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  let inputCreateBlog: HttpCreateBlogDto;
  let inputUpdateBlog: HttpUpdateBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    inputCreateBlog = blogsTestHelper.createInputDto();
    inputUpdateBlog = { ...inputCreateBlog };

    const createBlogResponse =
      await blogsTestHelper.createBlog(inputCreateBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update blog if input data is correct and admin auth is valid', async () => {
    inputUpdateBlog = {
      ...inputUpdateBlog,
      name: 'Updated name',
      description: 'Updated description',
      websiteUrl: 'https://updated-website.com',
    };

    await blogsTestHelper.updateBlog(blogId, inputUpdateBlog);

    const getResponse = await blogsTestHelper.getBlogById(blogId);
    const expectedBlog = blogsTestHelper.createExpectedBlog({
      ...inputUpdateBlog,
      id: blogId,
    });

    expect(getResponse.body).toEqual(expectedBlog);
  });

  it('should return BAD REQUEST if name is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = '';
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = 'a'.repeat(DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH + 1);
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = '';
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = 'a'.repeat(
      DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH + 1,
    );
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is empty string', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = '';
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl exceeds max length', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl =
      'https://' + 'a'.repeat(DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH + 1);
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl does not use https protocol', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'http://example.com';
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is not valid URL', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'not-a-valid-url';
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name field is missing', async () => {
    const { name, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.updateBlog(blogId, inputBlog as HttpUpdateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description field is missing', async () => {
    const { description, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.updateBlog(blogId, inputBlog as HttpUpdateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl field is missing', async () => {
    const { websiteUrl, ...inputBlog } = blogsTestHelper.createInputDto();
    await blogsTestHelper.updateBlog(blogId, inputBlog as HttpUpdateBlogDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.name = ' '.repeat(5);
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });
  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.description = ' '.repeat(5);
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });
  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = ' '.repeat(5);
    await blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't update blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    const inputUpdateBlogDto = blogsTestHelper.createInputDto();

    await request(app.getHttpServer())
      .put(`/blogs/${blogId}`)
      .send(inputUpdateBlogDto)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return NOT FOUND status if blog not exists', async () => {
    const notExistingBlogId = faker.database.mongodbObjectId().toString();
    const inputUpdateBlogDto = blogsTestHelper.createInputDto();
    await blogsTestHelper.updateBlog(notExistingBlogId, inputUpdateBlogDto, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
