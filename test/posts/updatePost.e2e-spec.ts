import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import request from 'supertest';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { InputUpdatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-update-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';

describe('update post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  let inputCreatePost: InputCreatePostDto;

  let blogId: string;
  let postId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);

    const blog = await blogsTestHelper.createRandomBlog();
    blogId = blog.id;

    inputCreatePost = {
      title: 'Post 1 title',
      shortDescription: 'Post 1 short description',
      content: 'Post 1 content bla bla bla bla bla bla bla bla',
      blogId,
    };

    const createPostResponse =
      await postsTestHelper.createPost(inputCreatePost);
    postId = createPostResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update post if input data is correct, blog exist, admin auth passed', async () => {
    const inputUpdatePost: InputUpdatePostDto = {
      ...inputCreatePost,
      title: 'Updated title',
    };

    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(inputUpdatePost)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't update post if not admin auth`, async () => {
    const inputUpdatePost: InputUpdatePostDto = {
      ...inputCreatePost,
      title: 'Updated 2 title',
    };

    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send(inputUpdatePost)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
