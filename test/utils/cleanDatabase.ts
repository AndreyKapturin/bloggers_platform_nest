import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';

export async function cleanDatabase(app: INestApplication): Promise<void> {
  await request(app.getHttpServer())
    .delete('/testing/all-data')
    .expect(HttpStatus.NO_CONTENT);
}
