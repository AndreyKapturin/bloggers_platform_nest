import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import request from 'supertest';
import { createBlog } from '../utils/createBlog';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { createPost } from '../utils/createPost';

describe('create post', () => {
  const inputBlog: InputCreateBlogDto = {
    name: 'Blog name',
    description: 'Blog description',
    websiteUrl: 'https://blog1.io',
  };

  let app: INestApplication;
  let blogId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    const createBlogResponse = await createBlog(app, inputBlog);
    blogId = createBlogResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create post if input data is correct, blog exist, admin auth passed`, async () => {
    const inputPost: InputCreatePostDto = {
      title: 'Post 1 title',
      shortDescription: 'Post 1 short description',
      content: 'Post 1 content bla bla bla bla bla bla bla bla',
      blogId,
    };

    await createPost(app, inputPost);
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
