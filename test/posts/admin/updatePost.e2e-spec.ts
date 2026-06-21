import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { SA_PostsTestHelper } from '../../utils/SA_PostsTestHelper';
import { ViewBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { DB_POST_CONSTRAINTS } from '../../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { Public_PostsTestHelper } from '../../utils/Public_PostsTestHelper';
import { HttpUpdateBlogPostDto } from '../../../src/modules/bloggers-platform/posts/api/dto/HttpUpdateBlogPost.dto';

describe('update post for blog', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let sa_postsTestHelper: SA_PostsTestHelper;
  let public_postsTestHelper: Public_PostsTestHelper;
  let blog: ViewBlogDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    sa_postsTestHelper = new SA_PostsTestHelper(app);
    public_postsTestHelper = new Public_PostsTestHelper(app);

    blog = await sa_blogsTestHelper.createRandomBlog();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update post if input data is correct, blog exist, admin auth passed', async () => {
    const createBlogPostDto = sa_postsTestHelper.createBlogPostInputDto();
    const createPostResponse = await sa_postsTestHelper.createBlogPost(
      blog.id,
      createBlogPostDto,
    );
    const postId = createPostResponse.body.id;

    const inputUpdatePost: HttpUpdateBlogPostDto = {
      ...createBlogPostDto,
      title: 'updated title',
      shortDescription: 'updated short description',
      content: 'updated content',
    };

    await sa_postsTestHelper.updateBlogPost(blog.id, postId, inputUpdatePost);

    const getPostAfterUpdateResponse =
      await public_postsTestHelper.getPost(postId);
    expect(getPostAfterUpdateResponse.body.title).toBe(inputUpdatePost.title);
    expect(getPostAfterUpdateResponse.body.shortDescription).toBe(
      inputUpdatePost.shortDescription,
    );
    expect(getPostAfterUpdateResponse.body.content).toBe(
      inputUpdatePost.content,
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title is empty string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, title: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title exceeds max length`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    const tooLongTitle = 'a'.repeat(DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, title: tooLongTitle },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title is not a string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, title: 123 } as unknown as HttpUpdateBlogPostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if title is a string of spaces`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, title: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription is empty string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, shortDescription: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription exceeds max length`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    const tooLongDescription = 'a'.repeat(
      DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH + 1,
    );
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, shortDescription: tooLongDescription },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription is not a string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, shortDescription: true } as unknown as HttpUpdateBlogPostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if shortDescription is a string of spaces`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, shortDescription: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content is empty string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content exceeds max length`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    const tooLongContent = 'a'.repeat(
      DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH + 1,
    );
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, content: tooLongContent },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content is not a string`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, content: {} } as unknown as HttpUpdateBlogPostDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if content is a string of spaces`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { ...dto, content: ' '.repeat(5) },
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update post. Return BAD_REQUEST if multiple fields are invalid`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const updatePostResponse = await sa_postsTestHelper.updateBlogPost(
      blog.id,
      post.id,
      { title: '', shortDescription: '', content: '' },
      { status: HttpStatus.BAD_REQUEST },
    );
    expect(updatePostResponse.body.errorsMessages).toBeInstanceOf(Array);
    expect(updatePostResponse.body.errorsMessages).toHaveLength(3);
  });

  it(`shouldn't update post. Return UNAUTHORIZED if not admin auth`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(blog.id, post.id, dto, {
      status: HttpStatus.UNAUTHORIZED,
      auth: false,
    });
  });

  it(`shouldn't update post. Return NOT FOUND if post not exist`, async () => {
    const notExistedPostId = crypto.randomUUID();
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(blog.id, notExistedPostId, dto, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it(`shouldn't update post. Return NOT FOUND if current blog not exist`, async () => {
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    const notExistedBlogId = crypto.randomUUID();
    const dto = sa_postsTestHelper.createInputDto(blog.id);
    await sa_postsTestHelper.updateBlogPost(notExistedBlogId, post.id, dto, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
