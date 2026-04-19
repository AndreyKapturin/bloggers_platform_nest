import { INestApplication, HttpStatus } from '@nestjs/common';
import requset from 'supertest';
import request, { Response } from 'supertest';

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
}
