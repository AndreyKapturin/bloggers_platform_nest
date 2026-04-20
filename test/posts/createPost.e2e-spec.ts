import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('create post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    const blog = await blogsTestHelper.createRandomBlog();
    blogId = blog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create post if input data is correct, blog exist, admin auth passed`, async () => {
    await postsTestHelper.createRandomPost(blogId);
  });

  it(`shouldn't create post if not admin auth`, async () => {
    const inputPost: InputCreatePostDto = {
      title: 'Post 2 title',
      shortDescription: 'Post 2 short description',
      content: 'Post 2 content bla bla bla bla bla bla bla bla',
      blogId,
    };

    await request(app.getHttpServer())
      .post('/posts')
      .send(inputPost)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
