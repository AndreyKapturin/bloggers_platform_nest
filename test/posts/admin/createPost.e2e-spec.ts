import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { SA_PostsTestHelper } from '../../utils/SA_PostsTestHelper';
import { ViewBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { LikeStatus } from '../../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { ViewPostDto } from '../../../src/modules/bloggers-platform/posts/api/dto/VIewPost.dto';
import { DB_POST_CONSTRAINTS } from '../../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { HttpCreatePostDto } from '../../../src/modules/bloggers-platform/posts/api/dto/HttpCreatePost.dto';

describe('create post', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let sa_postsTestHelper: SA_PostsTestHelper;
  let blog: ViewBlogDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    sa_postsTestHelper = new SA_PostsTestHelper(app);

    blog = await sa_blogsTestHelper.createRandomBlog();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create post. Return view post. If input data is correct, blog exist, admin auth passed`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    const createPostResponse = await sa_postsTestHelper.createBlogPost(
      blog.id,
      dto,
    );
    const expectedPost: ViewPostDto = sa_postsTestHelper.createExpectedPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    });
    expect(createPostResponse.body).toEqual(expectedPost);
  });

  it(`shouldn't create post. Return BAD_REQUEST if title is empty string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, title: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title exceeds max length`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    const tooLongTitle = 'a'.repeat(DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, title: tooLongTitle },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title is not a string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, title: 123 } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title is a string of spaces`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, title: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is empty string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, shortDescription: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription exceeds max length`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();

    const tooLongDescription = 'a'.repeat(
      DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH + 1,
    );
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, shortDescription: tooLongDescription },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is not a string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, shortDescription: true } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is a string of spaces`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, shortDescription: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is empty string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content exceeds max length`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    const tooLongContent = 'a'.repeat(
      DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH + 1,
    );
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, content: tooLongContent },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is not a string`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, content: {} } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is a string of spaces`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { ...dto, content: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if multiple fields are invalid`, async () => {
    await sa_postsTestHelper.createBlogPost(
      blog.id,
      { title: '', shortDescription: '', content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return UNAUTHORIZED status if not admin auth`, async () => {
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(blog.id, dto, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't create post. Return NOT FOUND if blog with passed id not exist`, async () => {
    const undexistedBlogId = crypto.randomUUID();
    const dto = sa_postsTestHelper.createBlogPostInputDto();
    await sa_postsTestHelper.createBlogPost(undexistedBlogId, dto, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
