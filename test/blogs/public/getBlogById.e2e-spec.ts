import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { HttpCreateBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { Public_BlogsTestHelper } from '../../utils/Public_BlogsTestHelper';

describe('get blog by id', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let public_blogsTestHelper: Public_BlogsTestHelper;
  let inputBlog: HttpCreateBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    public_blogsTestHelper = new Public_BlogsTestHelper(app);
    inputBlog = sa_blogsTestHelper.createInputDto();
    const createBlogResponse = await sa_blogsTestHelper.createBlog(inputBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should return view blog if blog exist`, async () => {
    const getBlogResponse = await public_blogsTestHelper.getBlogById(blogId);
    const expectedBlog = public_blogsTestHelper.createExpectedBlog();
    expect(getBlogResponse.body).toEqual(expectedBlog);
  });

  it('should return NOT FOUND status if blog not exist', async () => {
    const unexistedBlogId = crypto.randomUUID();
    await public_blogsTestHelper.getBlogById(unexistedBlogId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
