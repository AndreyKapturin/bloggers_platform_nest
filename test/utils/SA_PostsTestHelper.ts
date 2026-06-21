import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/VIewPost.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { ResponseWithBody } from './generics';
import { TViewNewestLike } from '../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { HttpCreateBlogPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreateBlogPost.dto';
import { PostsQueryParamsDto } from '../../src/modules/bloggers-platform/posts/api/dto/PostQueryParams.dto';
import { PostsDtoFabrics } from './PostDtoFabrics';
import { HttpUpdateBlogPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpUpdateBlogPost.dto';

export const expectedNewestLike: TViewNewestLike = {
  login: expect.any(String),
  userId: expect.any(String),
  addedAt: expect.any(String),
};

export class SA_PostsTestHelper {
  private BASE_URL = '/sa/blogs';

  constructor(private app: INestApplication) {}

  createBlogPostInputDto(): HttpCreateBlogPostDto {
    return PostsDtoFabrics.createBlogPostInputDto();
  }

  createInputDto(blogId: string): HttpCreateBlogPostDto {
    return PostsDtoFabrics.createInputDto(blogId);
  }

  createExpectedPost(overrdieFields: Partial<ViewPostDto> = {}) {
    return PostsDtoFabrics.createExpectedPost(overrdieFields);
  }

  async getBlogPosts(
    blogId: string,
    options?: {
      status?: HttpStatus;
      auth?: boolean;
      filter?: Partial<PostsQueryParamsDto>;
    },
  ): Promise<ResponseWithBody<PaginatedView<ViewPostDto>>> {
    const innerOptions = {
      status: HttpStatus.OK,
      auth: true,
      ...(options ?? {}),
    };

    const getRequest = request(this.app.getHttpServer())
      .get(`${this.BASE_URL}/${blogId}/posts`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      getRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    if (innerOptions?.filter) {
      getRequest.query(innerOptions.filter);
    }

    return getRequest;
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
      .post(`${this.BASE_URL}/${blogId}/posts`)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      createPostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return createPostRequest;
  }

  async createRandomPost(blogId: string): Promise<ViewPostDto> {
    const dto = this.createBlogPostInputDto();
    const createPostResponse = await this.createBlogPost(blogId, dto);
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

  async updateBlogPost(
    blogId: string,
    postId: string,
    dto: HttpUpdateBlogPostDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const updatePostRequest = request(this.app.getHttpServer())
      .put(`${this.BASE_URL}/${blogId}/posts/${postId}`)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      updatePostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return updatePostRequest;
  }

  async deletePost(
    blogId: string,
    postId: string,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const deletePostRequest = request(this.app.getHttpServer())
      .delete(`${this.BASE_URL}/${blogId}/posts/${postId}`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      deletePostRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return deletePostRequest;
  }
}
