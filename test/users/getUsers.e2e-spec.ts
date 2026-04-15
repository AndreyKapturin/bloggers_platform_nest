import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';

describe('get users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return OK status if admin auth passed', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.OK);
  });

  it('should return UNAUTHORIZED status if not admin auth', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
