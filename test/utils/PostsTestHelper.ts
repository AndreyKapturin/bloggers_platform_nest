import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { faker } from '@faker-js/faker';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.view-dto';
import { InputCreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.input-create-dto';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.view-dto';
import { HttpLikeStatusDto } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';

export const POST_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 30,
  SHORT_DESCRIPTION_MAX_LENGTH: 300,
  CONTENT_MAX_LENGTH: 1000,
};

export class PostsTestHelper {
  constructor(private app: INestApplication) {}

  async setLikeStatus(
    id: string,
    dto: HttpLikeStatusDto,
    options?: { status?: HttpStatus; accessToken?: string },
  ) {
    const likeRequest = request(this.app.getHttpServer())
      .put(`/posts/${id}/like-status`)
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);

    if (options?.accessToken) {
      likeRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return likeRequest;
  }

  async getPost(
    id: string,
    options?: { status?: HttpStatus; accessToken?: string },
  ): Promise<Response> {
    const getRequest = request(this.app.getHttpServer())
      .get(`/posts/${id}`)
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getRequest;
  }

  async createPost(
    dto: InputCreatePostDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post('/posts')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async createRandomPost(blogId: string): Promise<ViewPostDto> {
    const title = faker.lorem.words({ min: 1, max: 5 });
    const shortDescription = faker.lorem.sentence({ min: 5, max: 20 });
    const content = faker.lorem.sentence({ min: 5, max: 50 });

    const dto: InputCreatePostDto = {
      title,
      shortDescription,
      content,
      blogId,
    };

    const createPostResponse = await this.createPost(dto);
    return createPostResponse.body;
  }

  async createRandomPosts(
    blogId: string,
    count: number,
  ): Promise<ViewBlogDto[]> {
    const responses = new Array(count);

    for (let i = 0; i < count; i++) {
      responses[i] = await this.createRandomPost(blogId);
    }

    return responses;
  }
}
