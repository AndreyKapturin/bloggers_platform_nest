import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import request from 'supertest';
import { createBlog } from '../utils/createBlog';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { createPost } from '../utils/createPost';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';

describe('delete post', () => {
  const inputBlog: InputCreateBlogDto = {
    name: 'Blog name',
    description: 'Blog description',
    websiteUrl: 'https://blog1.io',
  };

  let inputCreatePost: InputCreatePostDto;

  let app: INestApplication;
  let blogId: string;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    const createBlogResponse = await createBlog(app, inputBlog);
    blogId = createBlogResponse.body.id;

    inputCreatePost = {
      title: 'Post 1 title',
      shortDescription: 'Post 1 short description',
      content: 'Post 1 content bla bla bla bla bla bla bla bla',
      blogId,
    };

    const createPostResponse = await createPost(app, inputCreatePost);
    postId = createPostResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete post if post exist, admin auth passed', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't delete post if not admin auth`, async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
