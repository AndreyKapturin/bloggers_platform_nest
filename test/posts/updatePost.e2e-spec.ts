import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { HttpUpdatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpUpdatePost.dto';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { DB_POST_CONSTRAINTS } from '../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { faker } from '@faker-js/faker';

describe('update post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let blog: ViewBlogDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    blog = await blogsTestHelper.createRandomBlog();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update post if input data is correct, blog exist, admin auth passed', async () => {
    const createPostDto = postsTestHelper.createInputDto(blog.id);
    const createPostResponse = await postsTestHelper.createPost(createPostDto);
    const postId = createPostResponse.body.id;

    const inputUpdatePost: HttpUpdatePostDto = {
      ...createPostDto,
      title: 'updated title',
      shortDescription: 'updated short description',
      content: 'updated content',
    };

    await postsTestHelper.updatePost(postId, inputUpdatePost);

    const getPostAfterUpdateResponse = await postsTestHelper.getPost(postId);
    expect(getPostAfterUpdateResponse.body.title).toBe(inputUpdatePost.title);
    expect(getPostAfterUpdateResponse.body.shortDescription).toBe(
      inputUpdatePost.shortDescription,
    );
    expect(getPostAfterUpdateResponse.body.content).toBe(
      inputUpdatePost.content,
    );
  });

  it('should update blog name if blogId was changed', async () => {
    const anotherBlog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

    const inputUpdatePost: HttpUpdatePostDto = {
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: anotherBlog.id,
    };

    await postsTestHelper.updatePost(post.id, inputUpdatePost);

    const getPostAfterUpdateResponse = await postsTestHelper.getPost(post.id);
    expect(getPostAfterUpdateResponse.body.blogName).toBe(anotherBlog.name);
  });

  it(`shouldn't update post. Return BAD_REQUEST if title is empty string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, title: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title exceeds max length`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    const tooLongTitle = 'a'.repeat(DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, title: tooLongTitle },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title is not a string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, title: 123 } as unknown as HttpUpdatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription is empty string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, shortDescription: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription exceeds max length`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    const tooLongDescription = 'a'.repeat(
      DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH + 1,
    );
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, shortDescription: tooLongDescription },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription is not a string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, shortDescription: true } as unknown as HttpUpdatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content is empty string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content exceeds max length`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    const tooLongContent = 'a'.repeat(
      DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH + 1,
    );
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, content: tooLongContent },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content is not a string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, content: {} } as unknown as HttpUpdatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if blogId is empty string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, blogId: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if blogId is not a string`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, blogId: 123 } as unknown as HttpUpdatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if blogId is not provided`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    const { blogId: _, ...dtoWithoutBlogId } = dto;
    await postsTestHelper.updatePost(
      post.id,
      dtoWithoutBlogId as unknown as HttpUpdatePostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if multiple fields are invalid`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const updatePostResponse = await postsTestHelper.updatePost(
      post.id,
      { title: '', shortDescription: '', content: '', blogId: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
    expect(updatePostResponse.body.errorsMessages).toBeInstanceOf(Array);
    expect(updatePostResponse.body.errorsMessages).toHaveLength(4);
  });

  it(`shouldn't update post. Return UNAUTHORIZED if not admin auth`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(post.id, dto, {
      status: HttpStatus.UNAUTHORIZED,
      auth: false,
    });
  });

  it(`shouldn't update post. Return NOT FOUND if post not exist`, async () => {
    const notExistedPostId = faker.database.mongodbObjectId().toString();
    const dto = postsTestHelper.createInputDto(blog.id);
    await postsTestHelper.updatePost(notExistedPostId, dto, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it(`shouldn't update post. Return NOT FOUND if blog not exist`, async () => {
    const post = await postsTestHelper.createRandomPost(blog.id);
    const notExistedBlogId = faker.database.mongodbObjectId().toString();
    const dto = postsTestHelper.createInputDto(notExistedBlogId);
    await postsTestHelper.updatePost(
      post.id,
      { ...dto, blogId: notExistedBlogId },
      { status: HttpStatus.NOT_FOUND },
    );
  });
});
