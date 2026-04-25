import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { LikeStatus } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/VIewPost.dto';
import { DB_POST_CONSTRAINTS } from '../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { HttpCreatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreatePost.dto';
import { faker } from '@faker-js/faker';

describe('create post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let blog: ViewBlogDto;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    blog = await blogsTestHelper.createRandomBlog();
    blogId = blog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create post. Return view post. If input data is correct, blog exist, admin auth passed`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    const createPostResponse = await postsTestHelper.createPost(dto);
    const expectedPost: ViewPostDto = postsTestHelper.createExpectedPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
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
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, title: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title exceeds max length`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    const tooLongTitle = 'a'.repeat(DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
    await postsTestHelper.createPost(
      { ...dto, title: tooLongTitle },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title is not a string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, title: 123 } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if title is a string of spaces`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, title: ''.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is empty string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, shortDescription: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription exceeds max length`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    const tooLongDescription = 'a'.repeat(
      DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH + 1,
    );
    await postsTestHelper.createPost(
      { ...dto, shortDescription: tooLongDescription },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is not a string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, shortDescription: true } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if shortDescription is a string of spaces`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, shortDescription: ''.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is empty string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content exceeds max length`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    const tooLongContent = 'a'.repeat(
      DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH + 1,
    );
    await postsTestHelper.createPost(
      { ...dto, content: tooLongContent },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is not a string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, content: {} } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if content is a string of spaces`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, content: ''.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if blogId is empty string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, blogId: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if blogId is not a string`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, blogId: 123 } as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if blogId is a string of spaces`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(
      { ...dto, blogId: ''.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if blogId is not provided`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    const { blogId: _, ...dtoWithoutBlogId } = dto;
    await postsTestHelper.createPost(
      dtoWithoutBlogId as unknown as HttpCreatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return BAD_REQUEST if multiple fields are invalid`, async () => {
    await postsTestHelper.createPost(
      { title: '', shortDescription: '', content: '', blogId: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't create post. Return UNAUTHORIZED status if not admin auth`, async () => {
    const dto = postsTestHelper.createInputDto(blogId);
    await postsTestHelper.createPost(dto, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't create post. Return NOT FOUND if blog with passed id not exist`, async () => {
    const undexistedBlogId = faker.database.mongodbObjectId().toString();
    const dto = postsTestHelper.createInputDto(undexistedBlogId);
    await postsTestHelper.createPost(dto, { status: HttpStatus.NOT_FOUND });
  });
});
