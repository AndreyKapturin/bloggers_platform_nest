import { INestApplication, HttpStatus } from '@nestjs/common';
import requset from 'supertest';
import request, { Response } from 'supertest';
import { LikeStatus } from '../../src/modules/bloggers-platform/comments/api/dto/HttpLikeComment.dto';
import { ViewCommentDto } from '../../src/modules/bloggers-platform/comments/api/dto/ViewComment.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';

const LIKE_STATUSES_REG_EXP = new RegExp(Object.values(LikeStatus).join('|'));

export class CommentsTestHelper {
  constructor(private app: INestApplication) {}

  async createComment(
    postId: string,
    accessToken: string,
    dto: { content: string },
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async getCommentById(
    id: string,
    options?: { status?: HttpStatus; accessToken?: string },
  ): Promise<Response> {
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
    await requset(this.app.getHttpServer())
      .put(`/comments/${id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send(inputStatus)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async getPostComments(
    postId: string,
    options?: { status?: HttpStatus; accessToken?: string },
  ): Promise<Response> {
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
    const expectedPaginatedComments: PaginatedView<ViewCommentDto> = {
      page: expect.any(Number),
      pagesCount: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayContaining([this.createExpectedComment()]),
      ...overrideFields,
    };
    return expectedPaginatedComments;
  }
}
