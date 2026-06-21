import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';

describe('delete blog', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;

  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    const blog = await sa_blogsTestHelper.createRandomBlog();
    blogId = blog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    await sa_blogsTestHelper.deleteBlog(blogId, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should delete blog if blog exist and admin auth passed', async () => {
    await sa_blogsTestHelper.deleteBlog(blogId);
  });

  it(`shouldn't delete blog if blog not exist`, async () => {
    const notExistingBlogId = crypto.randomUUID();
    await sa_blogsTestHelper.deleteBlog(notExistingBlogId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
