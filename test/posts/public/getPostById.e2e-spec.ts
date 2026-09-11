import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { SA_PostsTestHelper } from '../../utils/SA_PostsTestHelper';
import { ViewBlogDto } from '../../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { HttpCreateBlogPostDto } from '../../../src/modules/bloggers-platform/posts/api/dto/HttpCreateBlogPost.dto';
import { Public_PostsTestHelper } from '../../utils/Public_PostsTestHelper';

describe('get post by id', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let sa_postsTestHelper: SA_PostsTestHelper;
  let public_postsTestHelper: Public_PostsTestHelper;

  let blog: ViewBlogDto;
  let createPostDto: HttpCreateBlogPostDto;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    sa_postsTestHelper = new SA_PostsTestHelper(app);
    public_postsTestHelper = new Public_PostsTestHelper(app);

    blog = await sa_blogsTestHelper.createRandomBlog();
    createPostDto = sa_postsTestHelper.createBlogPostInputDto();
    const createPostResponse = await sa_postsTestHelper.createBlogPost(
      blog.id,
      createPostDto,
    );
    postId = createPostResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return view post if post exist', async () => {
    const getPostResponse = await public_postsTestHelper.getPost(postId);
    const expectedPost = sa_postsTestHelper.createExpectedPost({
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
    });
    expect(getPostResponse.body).toEqual(expectedPost);
  });

  it('should return NOT FOUND if post with passed id not exist', async () => {
    const undexistedPostId = crypto.randomUUID();
    await public_postsTestHelper.getPost(undexistedPostId, {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
