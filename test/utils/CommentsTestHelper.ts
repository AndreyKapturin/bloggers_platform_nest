import { INestApplication, HttpStatus } from '@nestjs/common';
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
}
