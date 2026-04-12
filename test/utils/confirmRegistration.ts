import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';

export const confirmRegistration = async (
  app: INestApplication,
  code: string
): Promise<Response> => {
  return await request(app.getHttpServer())
    .post('/auth/registration-confirmation')
    .send({ code });
};
