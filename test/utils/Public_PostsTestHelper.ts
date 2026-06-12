import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/VIewPost.dto';
import { HttpLikeStatusDto } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { ResponseWithBody } from './generics';
import { PostsQueryParamsDto } from '../../src/modules/bloggers-platform/posts/api/dto/PostQueryParams.dto';
import { PostsDtoFabrics } from './PostDtoFabrics';

export class Public_PostsTestHelper {
  private BASE_URL = '/posts';

  constructor(private app: INestApplication) {}

  createExpectedPost(overrdieFields: Partial<ViewPostDto> = {}) {
    return PostsDtoFabrics.createExpectedPost(overrdieFields);
  }

  async setLikeStatus(
    id: string,
    dto: HttpLikeStatusDto,
    options?: { status?: HttpStatus; accessToken?: string },
  ) {
    const likeRequest = request(this.app.getHttpServer())
      .put(`${this.BASE_URL}/${id}/like-status`)
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
      .get(`${this.BASE_URL}/${id}`)
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getRequest;
  }

  async getPosts(options?: {
    accessToken?: string;
    filter?: Partial<PostsQueryParamsDto>;
  }): Promise<ResponseWithBody<PaginatedView<ViewPostDto>>> {
    const getRequest = request(this.app.getHttpServer())
      .get(this.BASE_URL)
      .expect(HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    if (options?.filter) {
      getRequest.query(options.filter);
    }

    return getRequest;
  }

  async getBlogPosts(
    blogId: string,
    options?: {
      accessToken?: string;
      filter?: Partial<PostsQueryParamsDto>;
    },
  ): Promise<ResponseWithBody<PaginatedView<ViewPostDto>>> {
    const getRequest = request(this.app.getHttpServer())
      .get(`/blogs/${blogId}/posts`)
      .expect(HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    if (options?.filter) {
      getRequest.query(options.filter);
    }

    return getRequest;
  }
}
