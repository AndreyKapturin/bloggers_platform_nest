import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import request from 'supertest';
import { InputUpdateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-update-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';

describe('update blog', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;

  let inputCreateBlog: InputCreateBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    inputCreateBlog = blogsTestHelper.createInputDto();
    const createBlogResponse =
      await blogsTestHelper.createBlog(inputCreateBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should update blog if input data is correct and admin auth`, async () => {
    const inputUpdateBlogDto: InputUpdateBlogDto = {
      ...inputCreateBlog,
      name: 'Update 1 blog',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${blogId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(inputUpdateBlogDto)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't update blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    const inputUpdateBlogDto: InputUpdateBlogDto = {
      ...inputCreateBlog,
      name: 'Bad update',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${blogId}`)
      .send(inputUpdateBlogDto)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
