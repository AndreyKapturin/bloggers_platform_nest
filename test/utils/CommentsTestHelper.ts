import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { HttpCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/HttpComment.dto';
import { faker } from '@faker-js/faker';
import { LIKE_STATUSES_REG_EXP } from './reg-exp';
import { ResponseWithBody } from './generics';

export class CommentsTestHelper {
  constructor(private app: INestApplication) {}

  async deleteComment(
    commentId: string,
    accessToken: string,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async updateComment(
    commentId: string,
    accessToken: string,
    dto: HttpCommentDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .put(`/comments/${commentId}`)
      .auth(accessToken, { type: 'bearer' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async createComment(
    postId: string,
    accessToken: string,
    dto: HttpCommentDto,
    options?: { status: HttpStatus },
  ): Promise<ResponseWithBody<ViewCommentDto>> {
    return await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async createRandomComment(
    postId: string,
    accessToken: string,
  ): Promise<ViewCommentDto> {
    const content = faker.lorem.sentence({ min: 10, max: 30 });
    const dto: HttpCommentDto = { content };
    const response = await this.createComment(postId, accessToken, dto);
    return response.body;
  }

  async createRandomComments(
    count: number,
    postId: string,
    accessToken: string,
  ): Promise<ViewCommentDto[]> {
    const responses = new Array(count);

    for (let i = 0; i < count; i++) {
      responses[i] = await this.createRandomComment(postId, accessToken);
    }

    return responses;
  }

  async getCommentById(
    id: string,
    options?: { status?: HttpStatus; accessToken?: string },
  ): Promise<ResponseWithBody<ViewCommentDto>> {
    const getRequest = request(this.app.getHttpServer())
      .get(`/comments/${id}`)
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getRequest;
  }

  async setLikeStatus(
    id: string,
    inputStatus: { likeStatus: string },
    accessToken: string,
    options?: { status: HttpStatus },
  ) {
    await request(this.app.getHttpServer())
      .put(`/comments/${id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(inputStatus)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async getPostComments(
    postId: string,
    options?: { status?: HttpStatus; accessToken?: string },
  ): Promise<ResponseWithBody<PaginatedView<ViewCommentDto>>> {
    const getRequest = request(this.app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getRequest;
  }

  createExpectedComment(overrideFields: Partial<ViewCommentDto> = {}) {
    const expectedComment: ViewCommentDto = {
      id: expect.any(String),
      content: expect.any(String),
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.stringMatching(LIKE_STATUSES_REG_EXP),
      },
      ...overrideFields,
    };
    return expectedComment;
  }

  createExpectedComments(
    overrideFields: Partial<PaginatedView<ViewCommentDto>> = {},
  ) {
    return {
      page: expect.any(Number),
      pagesCount: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayContaining([this.createExpectedComment()]),
      ...overrideFields,
    };
  }
}
