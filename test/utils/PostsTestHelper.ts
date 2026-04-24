import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { faker } from '@faker-js/faker';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/dto/Post.view-dto';
import { HttpLikeStatusDto } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { ResponseWithBody } from './generics';
import { HttpCreatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreatePost.dto';
import { LIKE_STATUSES_REG_EXP } from './reg-exp';
import { NewestLike } from '../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { HttpUpdatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpUpdatePost.dto';
import { HttpCreateBlogPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreateBlogPost.dto';

const expectedNewestLike: NewestLike = {
  login: expect.any(String),
  userId: expect.any(String),
  addedAt: expect.any(String),
};

export class PostsTestHelper {
  constructor(private app: INestApplication) {}

  createBlogPostInputDto(): HttpCreateBlogPostDto {
    const title = faker.lorem.words({ min: 1, max: 3 });
    const shortDescription = faker.lorem.sentence({ min: 5, max: 10 });
    const content = faker.lorem.sentence({ min: 5, max: 50 });
    return {
      title,
      shortDescription,
      content,
    };
  }

  createInputDto(blogId: string): HttpCreatePostDto {
    return {
      ...this.createBlogPostInputDto(),
      blogId,
    };
  }

  createExpectedPost(overrdieFields: Partial<ViewPostDto> = {}) {
    const expectedPost: ViewPostDto = {
      id: expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      blogName: expect.any(String),
      blogId: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.stringMatching(LIKE_STATUSES_REG_EXP),
        newestLikes: expect.arrayOf(expectedNewestLike),
      },
      ...overrdieFields,
    };
    return expectedPost;
  }

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
  ): Promise<ResponseWithBody<ViewPostDto>> {
    const getRequest = request(this.app.getHttpServer())
      .get(`/posts/${id}`)
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getRequest;
  }

  async getPosts(options?: {
    accessToken?: string;
  }): Promise<ResponseWithBody<PaginatedView<ViewPostDto>>> {
    const getRequest = request(this.app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    const response = await getRequest;
    return response;
  }

  async createPost(
    dto: HttpCreatePostDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<ResponseWithBody<ViewPostDto>> {
    const innerOptions = {
      status: HttpStatus.CREATED,
      auth: true,
      ...options,
    };

    const createPostRequest = request(this.app.getHttpServer())
      .post('/posts')
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      createPostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return createPostRequest;
  }

  async createBlogPost(
    blogId: string,
    dto: HttpCreateBlogPostDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<ResponseWithBody<ViewPostDto>> {
    const innerOptions = {
      status: HttpStatus.CREATED,
      auth: true,
      ...options,
    };

    const createPostRequest = request(this.app.getHttpServer())
      .post(`/blogs/${blogId}/posts`)
      .send(dto)
      .expect(innerOptions.status);
    
    if (innerOptions.auth) {
      createPostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return createPostRequest;
  }

  async createRandomPost(blogId: string): Promise<ViewPostDto> {
    const dto = this.createInputDto(blogId);
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

  async updatePost(
    postId: string,
    dto: HttpUpdatePostDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const updatePostRequest = request(this.app.getHttpServer())
      .put(`/posts/${postId}`)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      updatePostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return updatePostRequest;
  }

  async deletePost(
    postId: string,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const deletePostRequest = request(this.app.getHttpServer())
      .delete(`/posts/${postId}`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      deletePostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return deletePostRequest;
  }
}
