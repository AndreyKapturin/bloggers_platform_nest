import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { HttpCreatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreatePost.dto';
import { faker } from '@faker-js/faker';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';

describe('get post by id', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  let blog: ViewBlogDto;
  let createPostDto: HttpCreatePostDto;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    blog = await blogsTestHelper.createRandomBlog();
    createPostDto = postsTestHelper.createInputDto(blog.id);
    const createPostResponse = await postsTestHelper.createPost(createPostDto);
    postId = createPostResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return view post if post exist', async () => {
    const getPostResponse = await postsTestHelper.getPost(postId);
    const expectedPost = postsTestHelper.createExpectedPost({
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: blog.name,
    });
    expect(getPostResponse.body).toEqual(expectedPost);
  });

  it('should return NOT FOUND if post with passed id not exist', async () => {
    const undexistedPostId = faker.database.mongodbObjectId().toString();
    await postsTestHelper.getPost(undexistedPostId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
