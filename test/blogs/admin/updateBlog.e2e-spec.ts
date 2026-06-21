import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { HttpCreateBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { HttpUpdateBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/HttpUpdateBlog.dto';
import { DB_BLOG_CONSTRAINTS } from '../../../src/modules/bloggers-platform/blogs/domain/blog.entity';
import { Public_BlogsTestHelper } from '../../utils/Public_BlogsTestHelper';

describe('update blog', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let public_blogsTestHelper: Public_BlogsTestHelper;

  let inputCreateBlog: HttpCreateBlogDto;
  let inputUpdateBlog: HttpUpdateBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    public_blogsTestHelper = new Public_BlogsTestHelper(app);
    inputCreateBlog = sa_blogsTestHelper.createInputDto();
    inputUpdateBlog = { ...inputCreateBlog };

    const createBlogResponse =
      await sa_blogsTestHelper.createBlog(inputCreateBlog);
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

    await sa_blogsTestHelper.updateBlog(blogId, inputUpdateBlog);

    const getResponse = await public_blogsTestHelper.getBlogById(blogId);
    const expectedBlog = sa_blogsTestHelper.createExpectedBlog({
      ...inputUpdateBlog,
      id: blogId,
    });

    expect(getResponse.body).toEqual(expectedBlog);
  });

  it('should return BAD REQUEST if name is empty string', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.name = '';
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name exceeds max length', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.name = 'a'.repeat(DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH + 1);
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description is empty string', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.description = '';
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if description exceeds max length', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.description = 'a'.repeat(
      DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH + 1,
    );
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is empty string', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = '';
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl exceeds max length', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.websiteUrl =
      'https://' + 'a'.repeat(DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH + 1);
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl does not use https protocol', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'http://example.com';
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if websiteUrl is not valid URL', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = 'not-a-valid-url';
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if name field is missing', async () => {
    const { name, ...inputBlog } = sa_blogsTestHelper.createInputDto();
    await sa_blogsTestHelper.updateBlog(
      blogId,
      inputBlog as HttpUpdateBlogDto,
      {
        status: HttpStatus.BAD_REQUEST,
      },
    );
  });

  it('should return BAD REQUEST if description field is missing', async () => {
    const { description, ...inputBlog } = sa_blogsTestHelper.createInputDto();
    await sa_blogsTestHelper.updateBlog(
      blogId,
      inputBlog as HttpUpdateBlogDto,
      {
        status: HttpStatus.BAD_REQUEST,
      },
    );
  });

  it('should return BAD REQUEST if websiteUrl field is missing', async () => {
    const { websiteUrl, ...inputBlog } = sa_blogsTestHelper.createInputDto();
    await sa_blogsTestHelper.updateBlog(
      blogId,
      inputBlog as HttpUpdateBlogDto,
      {
        status: HttpStatus.BAD_REQUEST,
      },
    );
  });

  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.name = ' '.repeat(5);
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });
  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.description = ' '.repeat(5);
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });
  it('should return BAD REQUEST if websiteUrl field is a string of spaces', async () => {
    const inputBlog = sa_blogsTestHelper.createInputDto();
    inputBlog.websiteUrl = ' '.repeat(5);
    await sa_blogsTestHelper.updateBlog(blogId, inputBlog, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't update blog. Return UNAUTHORIZED status if not admin auth`, async () => {
    const inputUpdateBlogDto = sa_blogsTestHelper.createInputDto();
    await sa_blogsTestHelper.updateBlog(blogId, inputUpdateBlogDto, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return NOT FOUND status if blog not exists', async () => {
    const notExistingBlogId = crypto.randomUUID();
    const inputUpdateBlogDto = sa_blogsTestHelper.createInputDto();
    await sa_blogsTestHelper.updateBlog(notExistingBlogId, inputUpdateBlogDto, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
